/**
 * ZEGOCLOUD LIVE STUDY ROOM SERVICE PLACEHOLDER
 * ============================================
 * TODO: Replace this placeholder with ZEGOCLOUD Web SDK (`@zegocloud/zego-uikit-prebuilt` or `zego-express-engine-webrtc`):
 * 1. Obtain `appID` and `serverSecret` from ZEGOCLOUD Admin Console.
 * 2. Generate kitToken (`ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, userId, userName)`).
 * 3. Create ZegoUIKitPrebuilt instance and join room container DOM node.
 * 4. Configure features: Scenario (Group Video Call / Voice Room), Screen Sharing, In-Room Chat.
 */

export interface ZegoRoomConfig {
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenShareEnabled: boolean;
}

export const zegoRoomService = {
  /**
   * TODO: Initialize ZEGOCLOUD SDK inside containerElement
   */
  async joinStudyRoom(config: ZegoRoomConfig, containerElement: HTMLElement): Promise<void> {
    console.log('[ZEGOCLOUD TODO] Initializing ZEGOCLOUD UIKit Live Room:', config);
    console.log('[ZEGOCLOUD TODO] Attach room UI to DOM node:', containerElement);
    
    // In production, this will mount the real WebRTC video stream grid.
  },

  /**
   * TODO: Leave room & clean up media streams
   */
  leaveStudyRoom(roomId: string): void {
    console.log(`[ZEGOCLOUD TODO] Leaving room ${roomId} and destroying ZegoEngine instance.`);
  }
};
