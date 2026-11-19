const notificationService = {
  async sendNotification() {
    return { success: true };
  },
  async getNotifications() {
    return { success: true, data: [] };
  },
  async markAsRead() {
    return { success: true };
  },
  async deleteNotification() {
    return { success: true };
  },
  async createNotification() {
    return { success: true };
  },
};

export default notificationService;
