package com.microsoft.hsf302_project.job;

import com.microsoft.hsf302_project.service.DateEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DateEventJobs {

    private final DateEventService dateEventService;

    // 08:00 mỗi ngày – gửi nhắc các event sẽ diễn ra sau đúng 2 ngày
    @Scheduled(cron = "0 0 8 * * *")
    public void sendReminders() {
        dateEventService.sendTwoDayReminders();
    }

    // Mỗi 30 phút – auto-finish các event đã kết thúc
    @Scheduled(cron = "0 */30 * * * *")
    public void autoFinish() {
        dateEventService.autoFinishPastEvents();
    }
}
