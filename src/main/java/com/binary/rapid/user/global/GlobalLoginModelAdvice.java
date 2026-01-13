package com.binary.rapid.user.global;

import com.binary.rapid.user.global.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.ui.Model;

@ControllerAdvice
public class GlobalLoginModelAdvice {

    @ModelAttribute
    public void addLoginInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Model model
    ) {
        boolean isLogin = (userDetails != null);
        int loginUserId = isLogin ? userDetails.getUser().getUserId() : 0;

        model.addAttribute("isLogin", isLogin);
        model.addAttribute("loginUserId", loginUserId);
    }
}
