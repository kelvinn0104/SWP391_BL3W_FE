/**
 * 100% MOCK API cho Collection Management Features (TESTING VERSION with Pagination)
 */

export async function getRequests() {
  const baseRequests = [
    {
      id: 'REQ-001',
      citizenName: 'Lê Văn Tùng',
      address: '12-A4, Chung cư Vinhomes Central Park, Bình Thạnh',
      wasteType: 'Nhựa & Kim loại',
      weightKg: 8.5,
      status: 'Pending',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      materials: [
        { type: 'Nhựa PET', amount: 5, unit: 'kg' },
        { type: 'Lon nhôm', amount: 3.5, unit: 'kg' }
      ],
      note: 'Rác đã được phân loại và rửa sạch.',
      images: ['https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&q=80&w=400'],
      priority: 'High'
    },
    {
      id: 'REQ-002',
      citizenName: 'Nguyễn Thị Hoa',
      address: '45 Lê Lợi, Quận 1',
      wasteType: 'Giấy & Thủy tinh',
      weightKg: 12.0,
      status: 'Accepted',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      materials: [
        { type: 'Báo cũ', amount: 10, unit: 'kg' },
        { type: 'Chai thủy tinh', amount: 2, unit: 'kg' }
      ],
      note: 'Có nhiều carton to cần xe tải nhỏ.',
      priority: 'Medium'
    },
    {
      id: 'REQ-003',
      citizenName: 'Trần Minh Quân',
      address: '156 Nguyễn Huệ, Quận 1',
      wasteType: 'Pin & thiết bị cũ',
      weightKg: 2.5,
      status: 'Assigned',
      collectorId: 'col-1',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      materials: [
        { type: 'Pin cũ', amount: 0.5, unit: 'kg' },
        { type: 'Bàn phím hỏng', amount: 2, unit: 'kg' }
      ],
      priority: 'High'
    },
    {
      id: 'REQ-004',
      citizenName: 'Phạm Thanh Bình',
      address: '89 Cách Mạng Tháng 8, Quận 3',
      wasteType: 'Nhựa tổng hợp',
      weightKg: 15.2,
      status: 'Collected',
      collectorId: 'col-2',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      materials: [
        { type: 'Nhựa HDPE', amount: 15.2, unit: 'kg' }
      ],
      priority: 'Low'
    }
  ];

  // Generate 24 items total for pagination testing
  const expandedRequests = [];
  const statuses = ['Pending', 'Accepted', 'Assigned', 'Collected', 'Cancelled'];
  const names = ['Hoàng Văn A', 'Trần Thị B', 'Nguyễn Văn C', 'Phan Văn D', 'Lê Thị E', 'Đặng Văn F'];
  const addresses = ['102 Lê Lai, Q1', '45 Phan Xích Long, PN', '22 Nguyễn Thị Minh Khai, Q3', '78 Võ Văn Tần, Q3', '15 Trần Hưng Đạo, Q1'];

  for (let i = 0; i < 24; i++) {
    if (i < baseRequests.length) {
      expandedRequests.push(baseRequests[i]);
    } else {
      const statusIndex = i % statuses.length;
      const status = statuses[statusIndex];
      expandedRequests.push({
        id: `REQ-${(i + 1).toString().padStart(3, '0')}`,
        citizenName: names[i % names.length],
        address: addresses[i % addresses.length],
        wasteType: i % 2 === 0 ? 'Nhựa & Kim loại' : 'Giấy & Carton',
        weightKg: Number((5 + Math.random() * 20).toFixed(1)),
        status: status,
        collectorId: (status === 'Assigned' || status === 'Collected') ? `col-${(i % 5) + 1}` : null,
        createdAt: new Date(Date.now() - 3600000 * i * 3).toISOString(),
        materials: [
          { type: 'Rác tổng hợp', amount: 10, unit: 'kg' }
        ],
        priority: i % 3 === 0 ? 'High' : 'Medium'
      });
    }
  }

  return expandedRequests; 
}

export async function getCollectors() {
  return [
    { id: 'col-1', name: 'Professional Collector', phone: '0901 234 567' },
    { id: 'col-2', name: 'Collector #1', phone: '0902 345 678' },
    { id: 'col-3', name: 'Collector #2', phone: '0903 456 789' },
    { id: 'col-4', name: 'Collector #3', phone: '0904 567 890' },
    { id: 'col-5', name: 'Collector #4', phone: '0905 678 901' },
    { id: 'col-6', name: 'Collector #5', phone: '0906 789 012' }
  ];
}

export async function assignRequest(requestId, collectorId) {
  return { success: true, requestId, collectorId };
}

export async function updateRequestStatus(requestId, newStatus) {
  return { success: true, requestId, status: newStatus };
}
