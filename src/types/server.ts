export interface Server {
  id: string;
  name: string;
  server_picture_url: string | null;
  invite_code: string;
  default_notification_setting: string;
}
