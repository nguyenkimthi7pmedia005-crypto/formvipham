import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Điền token và chat id cứng vào đây
const TOKEN = '7843396833:AAEvYzgcxJ35LfEkAHju74BM8YHZ7ag_knA';
const CHAT_ID = '1662565121';

const POST = async (req: NextRequest) => {
    const start = Date.now();
    const reqId = Math.random().toString(36).substring(7);

    try {
        const body = await req.json();
        const { message, message_id } = body;

        if (!message) {
            console.error(`[${reqId}] lỗi thiếu msg`);
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const isEdit = !!message_id;
        const url = `https://api.telegram.org/bot${TOKEN}/${isEdit ? 'editMessageText' : 'sendMessage'}`;

        const payload = {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            ...(isEdit && { message_id })
        };

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        const { result } = response.data || {};
        const resMsgId = result?.message_id ?? message_id ?? null;

        console.log(`[${reqId}] done:`, { status: response.status, msgId: resMsgId, time: `${Date.now() - start}ms` });

        return NextResponse.json({ success: true, message_id: resMsgId });

    } catch (err) {
        const isAxiosErr = axios.isAxiosError(err);
        console.error(`[${reqId}] lỗi call telegram api:`, isAxiosErr ? err.message : err);

        return NextResponse.json(
            { success: false, error: isAxiosErr ? err.message : 'server error' },
            { status: isAxiosErr && err.response?.status ? err.response.status : 500 }
        );
    }
};

export { POST };
