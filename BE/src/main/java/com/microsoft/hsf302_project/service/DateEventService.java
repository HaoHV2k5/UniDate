package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.CreateDateEventRequest;
import com.microsoft.hsf302_project.dto.request.RespondDateEventRequest;
import com.microsoft.hsf302_project.dto.response.DateEventResponse;
import com.microsoft.hsf302_project.entity.DateEvent;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repo.DateEventRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DateEventService {

    private final DateEventRepo dateEventRepo;
    private final UserRepo userRepo;
    private final MailService mailService;

    public DateEventResponse create(String creatorUsername, CreateDateEventRequest req) {
        User creator = userRepo.getUserByUsername(creatorUsername);
        User invitee = userRepo.getUserByUsername(req.getInviteeUsername());

        if (creator == null || invitee == null) throw new AppException(ErrorCode.USER_NOT_FOUND);
        if (!creator.isVerified() || !invitee.isVerified()) throw new AppException(ErrorCode.DATE_NOT_VERIFIED);
        if (creator.getUsername().equalsIgnoreCase(invitee.getUsername()))
            throw new AppException(ErrorCode.DATE_SELF_INVITE);

        if (req.getTitle() == null || req.getTitle().trim().isEmpty()
                || req.getLocation() == null || req.getLocation().trim().isEmpty()
                || req.getStartAt() == null || req.getEndAt() == null) {
            throw new AppException(ErrorCode.DATE_TIME_INVALID);
        }
        if (!req.getStartAt().isBefore(req.getEndAt()))
            throw new AppException(ErrorCode.DATE_TIME_INVALID);

        // conflict check cho cả 2 người (chỉ với ACCEPTED)
        if (isConflict(creator, req.getStartAt(), req.getEndAt())
                || isConflict(invitee, req.getStartAt(), req.getEndAt())) {
            throw new AppException(ErrorCode.DATE_TIME_CONFLICT);
        }

        DateEvent ev = DateEvent.builder()
                .title(req.getTitle().trim())
                .description(req.getDescription())
                .location(req.getLocation().trim())
                .startAt(req.getStartAt())
                .endAt(req.getEndAt())
                .creator(creator)
                .invitee(invitee)
                .status(DateEvent.Status.PENDING)
                .build();

        dateEventRepo.save(ev);
        return DateEventResponse.of(ev);
    }

    public List<DateEventResponse> myEvents(String username) {
        User me = userRepo.getUserByUsername(username);
        return dateEventRepo.findByCreatorOrInviteeOrderByStartAtAsc(me, me)
                .stream().map(DateEventResponse::of).toList();
    }

    public DateEventResponse respond(String inviteeUsername, Long id, RespondDateEventRequest req) {
        DateEvent ev = dateEventRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATE_EVENT_NOT_FOUND));

        if (!ev.getInvitee().getUsername().equals(inviteeUsername))
            throw new AppException(ErrorCode.DATE_PERMISSION_DENIED);

        if (ev.getStatus() != DateEvent.Status.PENDING)
            throw new AppException(ErrorCode.DATE_STATUS_INVALID);

        if (req.isAccept()) {
            if (isConflict(ev.getInvitee(), ev.getStartAt(), ev.getEndAt()))
                throw new AppException(ErrorCode.DATE_TIME_CONFLICT);
            ev.setStatus(DateEvent.Status.ACCEPTED);
        } else {
            ev.setStatus(DateEvent.Status.DECLINED);
        }

        dateEventRepo.save(ev);
        return DateEventResponse.of(ev);
    }

    public DateEventResponse cancel(String creatorUsername, Long id) {
        DateEvent ev = dateEventRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATE_EVENT_NOT_FOUND));

        if (!ev.getCreator().getUsername().equals(creatorUsername))
            throw new AppException(ErrorCode.DATE_PERMISSION_DENIED);

        if (ev.getStatus() == DateEvent.Status.DONE)
            throw new AppException(ErrorCode.DATE_STATUS_INVALID);

        ev.setStatus(DateEvent.Status.CANCELLED);
        dateEventRepo.save(ev);
        return DateEventResponse.of(ev);
    }

    // Job: gửi nhắc hẹn cho các event ACCEPTED có startAt thuộc NGÀY (+2)
    @Transactional(readOnly = true)
    public int sendTwoDayReminders() {
        LocalDateTime from = LocalDateTime.now()
                .plusDays(2).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime to = from.plusDays(1).minusNanos(1);

        log.info("[ReminderJob] Query events: from={} to={}", from, to);

        List<DateEvent> list = dateEventRepo.findAcceptedForReminder(
                DateEvent.Status.ACCEPTED, from, to);

        log.info("[ReminderJob] Found {} accepted events for reminders", list.size());

        int sent = 0;
        for (DateEvent e : list) {
            try {
                // Lúc này e.getCreator()/getInvitee() đã được load sẵn → KHÔNG còn LazyInitializationException
                mailService.sendDatingReminder(
                        e.getCreator().getEmail(), e.getCreator().getFullName(),
                        e.getTitle(), e.getStartAt(), e.getLocation(), e.getInvitee().getFullName()
                );
                mailService.sendDatingReminder(
                        e.getInvitee().getEmail(), e.getInvitee().getFullName(),
                        e.getTitle(), e.getStartAt(), e.getLocation(), e.getCreator().getFullName()
                );
                sent += 2;
                log.info("[ReminderJob] Sent 2 mails for event id={} title='{}'", e.getId(), e.getTitle());
            } catch (Exception ex) {
                log.error("[ReminderJob] Send mail failed for event id={}", e.getId(), ex);
            }
        }
        log.info("[ReminderJob] Total emails sent={}", sent);
        return sent;
    }

    // Job: auto-finish các event đã kết thúc
    public void autoFinishPastEvents() {
        List<DateEvent> list = dateEventRepo
                .findByStatusAndEndAtBefore(DateEvent.Status.ACCEPTED, LocalDateTime.now());
        for (DateEvent e : list) {
            e.setStatus(DateEvent.Status.DONE);
        }
        dateEventRepo.saveAll(list);
    }

    private boolean isConflict(User user, LocalDateTime start, LocalDateTime end) {
        return !dateEventRepo.findConflicts(DateEvent.Status.ACCEPTED, user, start, end).isEmpty();
        // true = có trùng lịch; false = không trùng
    }
}