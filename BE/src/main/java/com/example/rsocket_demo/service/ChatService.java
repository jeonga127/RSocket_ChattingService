package com.example.rsocket_demo.service;

import com.example.rsocket_demo.dto.ChatDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.rsocket.RSocketRequester;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final Map<String, Set<RSocketRequester>> participants = new ConcurrentHashMap<>();

    public void onConnect(RSocketRequester requester, String chattingAddress) {
        requester.rsocket()
                .onClose()
                .doFirst(() -> {
                    if(participants.containsKey(chattingAddress))
                        participants.get(chattingAddress).add(requester);
                    else participants.put(chattingAddress, Collections.synchronizedSet(new HashSet<>(Arrays.asList(requester))));
                })
                .doOnError(error -> {
                    log.info(error.getMessage());
                })
                .doFinally(consumer -> {
                    participants.get(chattingAddress).remove(requester);
                })
                .subscribe();
    }

    public Mono<ChatDto> message(ChatDto chatDto) {
        this.sendMessage(chatDto);
        return Mono.just(chatDto);
    }

    public void sendMessage(ChatDto chatDto) {
        Flux.fromIterable(participants.get(chatDto.getChattingAddress()))
                .doOnNext(ea -> {
                    ea.route("")
                            .data(chatDto)
                            .send()
                            .subscribe();
                })
                .subscribe();
    }
}