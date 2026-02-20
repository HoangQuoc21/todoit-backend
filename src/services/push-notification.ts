import type { ThirdPartyResponse } from "@/types";
import {
  Expo,
  type ExpoPushErrorReceipt,
  type ExpoPushMessage,
  type ExpoPushSuccessTicket,
} from "expo-server-sdk";

type SendRequest = {
  pushToken?: string | null;
  title: string;
  body?: string;
};

const sendExpoPushNotification = async (
  request: SendRequest,
): Promise<ThirdPartyResponse> => {
  const { pushToken, title, body } = request;

  if (!pushToken) {
    return {
      success: false,
      message: "No push token provided, can't send push notification",
    };
  }
  if (!Expo.isExpoPushToken(pushToken)) {
    return {
      success: false,
      message: "Invalid Expo push token, can't send push notification",
    };
  }

  const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN! });
  const message: ExpoPushMessage = {
    to: pushToken,
    sound: "default",
    title,
    body,
  };
  const chunks = expo.chunkPushNotifications([message]);

  const tickets: (ExpoPushSuccessTicket | ExpoPushErrorReceipt)[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("--> Error sending push notification:", error);
    }
  }

  let response: ThirdPartyResponse = {
    success: false,
    message: "Failed to send push notification",
  };

  for (const ticket of tickets) {
    if (ticket.status === "ok") {
      response = {
        success: true,
        message: `Push notification sent successfully with id: ${ticket.id}`,
      };
    } else {
      if (ticket.details && ticket.details.error) {
        response = {
          success: false,
          message: ticket.details.error,
        };
      }
    }
  }

  return response;
};

export const pushNotificationService = {
  sendExpoPushNotification,
};
