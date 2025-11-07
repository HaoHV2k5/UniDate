package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.DateEvent;
import com.microsoft.hsf302_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DateEventRepo extends JpaRepository<DateEvent, Long> {

    // Lấy các event user là creator hoặc invitee
    List<DateEvent> findByCreatorOrInviteeOrderByStartAtAsc(User creator, User invitee);

    // Tìm event ACCEPTED giao nhau thời gian (để tránh trùng lịch)
    // DÙNG JPQL: (status = ACCEPTED) AND (creator = :user OR invitee = :user)
    // AND (startAt <= :end) AND (endAt >= :start)
    @Query("""
           SELECT e FROM DateEvent e
           WHERE e.status = :status
             AND (e.creator = :user OR e.invitee = :user)
             AND e.startAt <= :end
             AND e.endAt >= :start
           """)
    List<DateEvent> findConflicts(
            @Param("status") DateEvent.Status status,
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // Lấy các event ACCEPTED bắt đầu trong [from, to]
    List<DateEvent> findByStatusAndStartAtBetween(DateEvent.Status status, LocalDateTime from, LocalDateTime to);

    // Lấy các event ACCEPTED đã quá giờ kết thúc
    List<DateEvent> findByStatusAndEndAtBefore(DateEvent.Status status, LocalDateTime before);

    @Query("""
       SELECT e FROM DateEvent e
       JOIN FETCH e.creator c
       JOIN FETCH e.invitee i
       WHERE e.status = :status
         AND e.startAt BETWEEN :from AND :to
       """)
    List<DateEvent> findAcceptedForReminder(
            @Param("status") DateEvent.Status status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
