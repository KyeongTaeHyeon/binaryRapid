//package com.binary.rapid.user.global.jwt;
//
//import com.binary.rapid.user.dto.UserDto;
//import com.binary.rapid.user.dto.UserResponseDto;
//import com.binary.rapid.user.global.security.CustomUserDetails;
//import com.binary.rapid.user.mapper.UserMapper;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//
//@Component
//@RequiredArgsConstructor
//public class JwtAuthenticationFilter extends OncePerRequestFilter {
//
//    private final JwtUtil jwtUtil;
//    private final UserMapper userMapper;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request,
//                                    HttpServletResponse response,
//                                    FilterChain filterChain)
//            throws ServletException, IOException {
//
//        String authHeader = request.getHeader("Authorization");
//
//        if (authHeader != null && authHeader.startsWith("Bearer ")) {
//            String token = authHeader.substring(7);
//
//            if (jwtUtil.validateToken(token)
//                    && SecurityContextHolder.getContext().getAuthentication() == null) {
//
//                String email = jwtUtil.getEmailFromToken(token);
//
//                UserResponseDto user = userMapper.selectUserId(email);
//
//                if (user != null) {
//                    CustomUserDetails customUserDetails = new CustomUserDetails(user);
//
//                    UsernamePasswordAuthenticationToken authentication =
//                            new UsernamePasswordAuthenticationToken(
//                                    customUserDetails,
//                                    null,
//                                    customUserDetails.getAuthorities()
//                            );
//
//                    authentication.setDetails(
//                            new WebAuthenticationDetailsSource().buildDetails(request)
//                    );
//
//                    SecurityContextHolder.getContext().setAuthentication(authentication);
//                }
//            }
//        }
//
//        filterChain.doFilter(request, response);
//    }
//
//}