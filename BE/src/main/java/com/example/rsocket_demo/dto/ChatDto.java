package com.example.rsocket_demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ChatDto {
    private String username;
    private String message;
    private String chattingAddress;
}