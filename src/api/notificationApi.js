import api from './api';

const processNotification = (apiNotif) => ({
    id: apiNotif.id,
    title: apiNotif.title,
    message: apiNotif.body,
    type: getFrontendType(apiNotif.type),
    relatedReportId: apiNotif.relatedReportId,
    isRead: apiNotif.isRead,
    createdAtUtc: apiNotif.createdAtUtc,
    time: formatTimeAgo(apiNotif.createdAtUtc), // Helper property for UI
});

const getFrontendType = (backendType) => {
    switch (backendType) {
        case 'ReportCreated':
        case 'CollectorAssigned':
            return 'info';
        case 'CollectorAccepted':
        case 'ReportCollected':
            return 'success';
        case 'ReportCancelled':
            return 'warning';
        default:
            return 'info';
    }
};

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
};

const notificationApi = {
    getNotifications: async (limit = 50) => {
        const response = await api.get(`/notifications?limit=${limit}`);
        return response.data.map(processNotification);
    },

    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data.count;
    },

    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    }
};

export default notificationApi;
