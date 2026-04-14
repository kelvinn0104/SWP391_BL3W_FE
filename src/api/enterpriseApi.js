/**
 * Mock API cho Enterprise Features
 * (Thay thế bằng axios calls khi có API thật)
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let mockCapacity = {
  acceptedWasteTypes: ['Plastic', 'Paper', 'Metals'],
  areas: [
    { id: 'area-1', district: 'Bình Thạnh', monthlyCapacityKg: 15000, processedThisMonthKg: 12500, completedRequests: 412,
      wards: [
        { name: 'Phường 25', collectors: ['Trần Văn A'], collectedKg: 1500, completedRequests: 50 },
        { name: 'Phường 26', collectors: ['Nguyễn Thị B'], collectedKg: 1700, completedRequests: 60 },
        { name: 'Phường 13', collectors: ['Trần Văn C'], collectedKg: 1000, completedRequests: 35 },
        { name: 'Phường 15', collectors: ['Nguyễn Văn D'], collectedKg: 2100, completedRequests: 74 },
        { name: 'Phường 22', collectors: ['Trần Thị E'], collectedKg: 2500, completedRequests: 80 },
        { name: 'Phường 28', collectors: ['Nguyễn Văn F'], collectedKg: 1200, completedRequests: 42 },
        { name: 'Phường 12', collectors: ['Trần Thị G'], collectedKg: 1300, completedRequests: 45 },
        { name: 'Phường 3', collectors: ['Nguyễn Văn H'], collectedKg: 1200, completedRequests: 26 }
      ]
    },
    { id: 'area-2', district: 'Quận 1', monthlyCapacityKg: 8500, processedThisMonthKg: 8200, completedRequests: 320,
      wards: [
        { name: 'Phường Bến Nghé', collectors: ['Nguyễn Văn I'], collectedKg: 1800, completedRequests: 80 },
        { name: 'Phường Bến Thành', collectors: ['Trần Thị K'], collectedKg: 2200, completedRequests: 95 },
        { name: 'Phường Đa Kao', collectors: ['Nguyễn Văn L'], collectedKg: 1500, completedRequests: 60 },
        { name: 'Phường Phạm Ngũ Lão', collectors: ['Trần Thị M'], collectedKg: 1100, completedRequests: 40 },
        { name: 'Phường Tân Định', collectors: ['Nguyễn Văn N'], collectedKg: 1600, completedRequests: 45 }
      ]
    },
    { id: 'area-3', district: 'Gò Vấp', monthlyCapacityKg: 12000, processedThisMonthKg: 9500, completedRequests: 310,
      wards: [
        { name: 'Phường 7', collectors: ['Trần Văn O'], collectedKg: 3000, completedRequests: 90 },
        { name: 'Phường 10', collectors: ['Nguyễn Thị P'], collectedKg: 3500, completedRequests: 120 },
        { name: 'Phường 1', collectors: ['Trần Văn Q'], collectedKg: 1000, completedRequests: 30 },
        { name: 'Phường 3', collectors: ['Nguyễn Thị R'], collectedKg: 1500, completedRequests: 50 },
        { name: 'Phường 11', collectors: ['Trần Văn S'], collectedKg: 500, completedRequests: 20 }
      ]
    },
    { id: 'area-4', district: 'Thủ Đức', monthlyCapacityKg: 18000, processedThisMonthKg: 16500, completedRequests: 520, 
      wards: [
        { name: 'Hiệp Bình Chánh', collectors: ['Nguyễn Văn T'], collectedKg: 4000, completedRequests: 120 },
        { name: 'Hiệp Bình Phước', collectors: ['Trần Thị U'], collectedKg: 3500, completedRequests: 110 },
        { name: 'Linh Chiểu', collectors: ['Nguyễn Văn V'], collectedKg: 3000, completedRequests: 90 },
        { name: 'Linh Đông', collectors: ['Trần Thị X'], collectedKg: 6000, completedRequests: 200 }
      ] 
    },
    { id: 'area-5', district: 'Quận 7', monthlyCapacityKg: 11000, processedThisMonthKg: 10000, completedRequests: 380, 
      wards: [
        { name: 'Tân Phong', collectors: ['Nguyễn Văn Y'], collectedKg: 5000, completedRequests: 180 },
        { name: 'Tân Quy', collectors: ['Trần Thị Z'], collectedKg: 3000, completedRequests: 120 },
        { name: 'Phú Mỹ', collectors: ['Nguyễn Thị A1'], collectedKg: 2000, completedRequests: 80 }
      ] 
    },
    { id: 'area-6', district: 'Quận 4', monthlyCapacityKg: 4000, processedThisMonthKg: 3500, completedRequests: 145, wards: [{ name: 'Phường 1', collectors: ['Trần Văn B1'], collectedKg: 1500, completedRequests: 65 }, { name: 'Phường 3', collectors: ['Nguyễn Văn C1'], collectedKg: 2000, completedRequests: 80 }] },
    { id: 'area-7', district: 'Quận 5', monthlyCapacityKg: 3500, processedThisMonthKg: 3000, completedRequests: 110, wards: [{ name: 'Phường 11', collectors: ['Trần Thị D1'], collectedKg: 1000, completedRequests: 40 }, { name: 'Phường 12', collectors: ['Nguyễn Văn E1'], collectedKg: 2000, completedRequests: 70 }] },
    { id: 'area-8', district: 'Quận 10', monthlyCapacityKg: 4000, processedThisMonthKg: 3800, completedRequests: 130, wards: [{ name: 'Phường 12', collectors: ['Trần Văn F1'], collectedKg: 3800, completedRequests: 130 }, { name: 'Phường 14', collectors: ['Nguyễn Thị G1'], collectedKg: 1200, completedRequests: 40 }] },
    { id: 'area-9', district: 'Tân Bình', monthlyCapacityKg: 7000, processedThisMonthKg: 6000, completedRequests: 195, wards: [{ name: 'Phường 2', collectors: ['Trần Văn H1'], collectedKg: 6000, completedRequests: 195 }] },
    { id: 'area-10', district: 'Phú Nhuận', monthlyCapacityKg: 2500, processedThisMonthKg: 2200, completedRequests: 95, wards: [{ name: 'Phường 9', collectors: ['Nguyễn Thị I1'], collectedKg: 2200, completedRequests: 95 }] },
    { id: 'area-11', district: 'Quận 3', monthlyCapacityKg: 5000, processedThisMonthKg: 4500, completedRequests: 210, wards: [{ name: 'Võ Thị Sáu', collectors: ['Trần Văn K1'], collectedKg: 4500, completedRequests: 210 }] },
    { id: 'area-12', district: 'Bình Tân', monthlyCapacityKg: 9000, processedThisMonthKg: 8100, completedRequests: 290, wards: [{ name: 'Bình Trị Đông', collectors: ['Nguyễn Văn Khang'], collectedKg: 5000, completedRequests: 150 }, { name: 'Tân Tạo', collectors: ['Trần Thị Mai'], collectedKg: 3100, completedRequests: 140 }] },
    { id: 'area-13', district: 'Quận 12', monthlyCapacityKg: 13000, processedThisMonthKg: 11000, completedRequests: 350, wards: [{ name: 'Trung Mỹ Tây', collectors: ['Nguyễn Văn L1'], collectedKg: 5000, completedRequests: 150 }, { name: 'Tân Thới Nhất', collectors: ['Trần Thị M1'], collectedKg: 6000, completedRequests: 200 }] },
    { id: 'area-14', district: 'Quận 8', monthlyCapacityKg: 6500, processedThisMonthKg: 5000, completedRequests: 180, wards: [{ name: 'Phường 4', collectors: ['Nguyễn Văn N1'], collectedKg: 2500, completedRequests: 80 }, { name: 'Phường 5', collectors: ['Trần Thị O1'], collectedKg: 2500, completedRequests: 100 }] },
    { id: 'area-15', district: 'Quận 6', monthlyCapacityKg: 4500, processedThisMonthKg: 4000, completedRequests: 120, wards: [{ name: 'Phường 1', collectors: ['Nguyễn Văn P1'], collectedKg: 2000, completedRequests: 60 }, { name: 'Phường 2', collectors: ['Trần Thị Q1'], collectedKg: 2000, completedRequests: 60 }] },
    { id: 'area-16', district: 'Hóc Môn', monthlyCapacityKg: 14000, processedThisMonthKg: 9000, completedRequests: 250, wards: [{ name: 'Bà Điểm', collectors: ['Nguyễn Văn R1'], collectedKg: 4500, completedRequests: 120 }, { name: 'Xuân Thới Thượng', collectors: ['Trần Thị S1'], collectedKg: 4500, completedRequests: 130 }] },
    { id: 'area-17', district: 'Củ Chi', monthlyCapacityKg: 20000, processedThisMonthKg: 15000, completedRequests: 400, wards: [{ name: 'Phước Vĩnh An', collectors: ['Nguyễn Văn T1'], collectedKg: 7500, completedRequests: 200 }, { name: 'Tân Hội', collectors: ['Trần Thị U1'], collectedKg: 7500, completedRequests: 200 }] },
    { id: 'area-18', district: 'Bình Chánh', monthlyCapacityKg: 16000, processedThisMonthKg: 14000, completedRequests: 320, wards: [{ name: 'Bình Hưng', collectors: ['Nguyễn Văn V1'], collectedKg: 7000, completedRequests: 160 }, { name: 'Vĩnh Lộc A', collectors: ['Trần Thị X1'], collectedKg: 7000, completedRequests: 160 }] }
  ],
};

let mockRequests = [
  { id: 'REQ-001', citizenName: 'Nguyen Van A', wasteType: 'Plastic', weightKg: 15, address: '12 Nguyen Hue, District 1', status: 'Pending', collectorId: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'REQ-002', citizenName: 'Tran Thi B', wasteType: 'Paper', weightKg: 40, address: '45 Le Loi, District 1', status: 'Pending', collectorId: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'REQ-003', citizenName: 'Le Van C', wasteType: 'Glass', weightKg: 8, address: '88 Dien Bien Phu, Binh Thanh District', status: 'Assigned', collectorId: 'COL-001', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: 'REQ-004', citizenName: 'Pham Ngoc D', wasteType: 'Metals', weightKg: 120, address: '190 Pasteur, District 3', status: 'Completed', collectorId: 'COL-002', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
];

let mockCollectors = [
  { id: 'COL-001', name: 'Nguyễn Văn A', phone: '0901234567' },
  { id: 'COL-002', name: 'Nguyễn Văn B', phone: '0987654321' },
  { id: 'COL-003', name: 'Trần Văn Mạnh', phone: '0912345678' },
  { id: 'COL-004', name: 'Nguyễn Thị Hoa', phone: '0922345678' },
  { id: 'COL-005', name: 'Phạm Tiến Dũng', phone: '0932345678' },
  { id: 'COL-006', name: 'Nguyễn Thị Hồng', phone: '0942345678' },
  { id: 'COL-007', name: 'Nguyễn Văn Khang', phone: '0952345678' },
  { id: 'COL-008', name: 'Trần Thị Mai', phone: '0962345678' },
  { id: 'COL-010', name: 'Nguyễn Văn L1', phone: '0972345678' },
  { id: 'COL-011', name: 'Trần Thị M1', phone: '0982345678' },
  { id: 'COL-012', name: 'Nguyễn Văn N1', phone: '0992345678' },
  { id: 'COL-013', name: 'Trần Thị O1', phone: '0901112223' },
  { id: 'COL-014', name: 'Nguyễn Văn P1', phone: '0903334445' },
  { id: 'COL-015', name: 'Trần Thị Q1', phone: '0905556667' },
  { id: 'COL-016', name: 'Nguyễn Văn R1', phone: '0907778889' },
  { id: 'COL-017', name: 'Trần Thị S1', phone: '0909990001' },
  { id: 'COL-018', name: 'Nguyễn Văn T1', phone: '0901110002' },
  { id: 'COL-019', name: 'Trần Thị U1', phone: '0902220003' },
  { id: 'COL-020', name: 'Nguyễn Văn V1', phone: '0903330004' },
  { id: 'COL-021', name: 'Trần Thị X1', phone: '0904440005' },
  { id: 'COL-022', name: 'Nguyễn Văn Y1', phone: '0905550006' },
  { id: 'COL-023', name: 'Trần Thị Z1', phone: '0906660007' },
];

export async function getCapacity() {
  await delay(600);
  return { ...mockCapacity };
}

export async function updateCapacity(data) {
  await delay(800);
  mockCapacity = { ...mockCapacity, ...data };
  return { ...mockCapacity };
}

export async function getRequests() {
  await delay(600);
  return [...mockRequests];
}

export async function getCollectors() {
  await delay(300);
  return [...mockCollectors];
}

export async function assignRequest(requestId, collectorId) {
  await delay(500);
  const req = mockRequests.find((r) => r.id === requestId);
  if (req) {
    req.collectorId = collectorId;
    req.status = 'Assigned';
  }
  return req;
}

export async function updateRequestStatus(requestId, newStatus) {
  await delay(500);
  const req = mockRequests.find((r) => r.id === requestId);
  if (req) {
    req.status = newStatus;
  }
  return req;
}
