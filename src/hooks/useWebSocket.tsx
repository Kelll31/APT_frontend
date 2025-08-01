import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
    shouldConnect?: boolean;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    onOpen?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
    onMessage?: (event: MessageEvent) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
    const {
        shouldConnect = true,
        reconnectAttempts = 5,
        reconnectInterval = 3000,
        onOpen,
        onClose,
        onError,
        onMessage,
    } = options;

    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
    const [messageHistory, setMessageHistory] = useState<MessageEvent[]>([]);

    const ws = useRef<WebSocket | null>(null);
    const reconnectCount = useRef(0);
    const reconnectTimeoutId = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnect = useRef(true);

    const connect = useCallback(() => {
        if (!shouldConnect || ws.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            setConnectionStatus('connecting');
            ws.current = new WebSocket(url);

            ws.current.onopen = (event) => {
                setConnectionStatus('connected');
                reconnectCount.current = 0;
                onOpen?.(event);
            };

            ws.current.onclose = (event) => {
                setConnectionStatus('disconnected');
                onClose?.(event);

                // Attempt to reconnect if it wasn't a manual close
                if (shouldReconnect.current && reconnectCount.current < reconnectAttempts) {
                    reconnectCount.current++;
                    reconnectTimeoutId.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.current.onerror = (event) => {
                setConnectionStatus('error');
                onError?.(event);
            };

            ws.current.onmessage = (event) => {
                setLastMessage(event);
                setMessageHistory(prev => [...prev.slice(-99), event]); // Keep last 100 messages
                onMessage?.(event);
            };
        } catch (error) {
            setConnectionStatus('error');
            console.error('WebSocket connection error:', error);
        }
    }, [url, shouldConnect, reconnectAttempts, reconnectInterval, onOpen, onClose, onError, onMessage]);

    const disconnect = useCallback(() => {
        shouldReconnect.current = false;

        if (reconnectTimeoutId.current) {
            clearTimeout(reconnectTimeoutId.current);
            reconnectTimeoutId.current = null;
        }

        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }

        setConnectionStatus('disconnected');
    }, []);

    const sendMessage = useCallback((message: string | object) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
            ws.current.send(messageToSend);
            return true;
        } else {
            console.warn('WebSocket is not connected. Cannot send message:', message);
            return false;
        }
    }, []);

    const sendJsonMessage = useCallback((object: object) => {
        return sendMessage(JSON.stringify(object));
    }, [sendMessage]);

    // Connect when component mounts or when shouldConnect changes to true
    useEffect(() => {
        if (shouldConnect) {
            shouldReconnect.current = true;
            connect();
        } else {
            disconnect();
        }

        // Cleanup on unmount
        return () => {
            shouldReconnect.current = false;
            disconnect();
        };
    }, [shouldConnect, connect, disconnect]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (reconnectTimeoutId.current) {
                clearTimeout(reconnectTimeoutId.current);
            }
        };
    }, []);

    return {
        connectionStatus,
        lastMessage,
        messageHistory,
        sendMessage,
        sendJsonMessage,
        connect,
        disconnect,
    };
}

export default useWebSocket;
