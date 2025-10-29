package com.microsoft.hsf302_project.dto.request;

import com.microsoft.hsf302_project.enums.Role;
import lombok.Data;

@Data
public class UserCreationRequest {
    private String username;
    private String email;
    private String phone;
    private String fullName;
<<<<<<< HEAD
    private String password;
=======
    private String passwordHash;
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84
    private Role role;
}
