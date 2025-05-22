import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import RoomDetailsModal from './RoomDetailsModal.js';

function AdminRoom() {
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState({
        addMessageSuccess: '',
        addMessageFail: '',
        updateMessageSuccess: '',
        updateMessageFail: '',
        deleteMessageSuccess: '',
        deleteMessageFail: '',
    });
    const [categories, setCategories] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [endPage, setEndPage] = useState(1);
    const [page, setPage] = useState(0); // Current page
    const size = 10; // Number of rooms per page
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [role, setRole] = useState(null);
    const [selectedBookingId, setSelectedBookingId] = useState(null); // ID đặt phòng được chọn
    const [isRoomDetailsModalVisible, setIsRoomDetailsModalVisible] = useState(false);

    const navigate = useNavigate();

    // Giải mã token để lấy role
    const decodeToken = () => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('Full decoded token:', decoded); // In toàn bộ payload

                setRole(decoded.role); // Lấy giá trị 'sub' từ payload
            } catch (error) {
                console.error('Invalid token', error);
            }
        }
    };

    useEffect(() => {
        decodeToken();
        fetchRooms();
        fetchCategories();
        fetchHotels();
    }, [page]);
    const getToken = () => localStorage.getItem('token');

    const fetchRooms = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:8080/admin/room/?page=${page}&size=${size}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRooms(response.data.data.data);
            setEndPage(response.data.data.totalPages);
        } catch (error) {
            console.error('Error fetching rooms', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = getToken();
            const response = await axios.get('http://localhost:8080/category/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }); // Adjust this to your actual endpoint
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    const fetchHotels = async () => {
        try {
            const token = getToken();
            const response = await axios.get('http://localhost:8080/hotel/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }); // Adjust this to your actual endpoint
            setHotels(response.data.data);
        } catch (error) {
            console.error('Error fetching hotels', error);
        }
    };
    const handleDeleteClick = (id) => {
        setRoomToDelete(id);
        setDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            await axios.delete('http://localhost:8080/admin/room/', {
                params: { id: roomToDelete },
                headers: { Authorization: `Bearer ${token}` },
            });
            setDialogOpen(false);
            setRoomToDelete(null); // Xóa trạng thái phòng cần xóa
            fetchRooms(); // Lấy lại danh sách phòng
            setMessages({ ...messages, deleteMessageSuccess: 'Xóa phòng thành công' });
        } catch (error) {
            setDialogOpen(false);
            setMessages({ ...messages, deleteMessageFail: 'Xóa phòng thất bại' });
            console.error('Error deleting room', error);
        }
    };

    const handleDiscountChange = async (roomId, newDiscount) => {
        try {
            const token = getToken();
            const response = await axios.put('http://localhost:8080/admin/room/update-discount', null, {
                params: { roomId, discount: newDiscount },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages({ ...messages, updateMessageSuccess: 'Cập nhật giảm giá thành công' });
            fetchRooms(); // Lấy lại danh sách phòng để cập nhật giá giảm
        } catch (error) {
            setMessages({ ...messages, updateMessageFail: 'Cập nhật giảm giá thất bại' });
            console.error('Error updating discount', error);
        }
    };

    const handleGlobalDiscountChange = async (newDiscount) => {
        try {
            const token = getToken();
            await axios.put('http://localhost:8080/admin/room/update-all-discounts', null, {
                params: { discount: newDiscount },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages({ ...messages, updateMessageSuccess: 'Cập nhật giảm giá tất cả thành công' });
            fetchRooms();
        } catch (error) {
            setMessages({ ...messages, updateMessageFail: 'Cập nhật giảm giá tất cả thất bại' });
            console.error('Error updating all discounts', error);
        }
    };
    const handleViewDetails = (bookingId) => {
        console.log(bookingId);
        setSelectedBookingId(bookingId);
        setIsRoomDetailsModalVisible(true);
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light text-center rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Quản Lý Phòng</h6>

                    <div className="admin-room-discount d-flex align-items-center">
                        <h6 className="mb-0 me-2">Giảm giá tất cả:</h6>
                        <select
                            className="form-select discount-select"
                            aria-label="Default select example"
                            onChange={(e) => handleGlobalDiscountChange(e.target.value)}
                        >
                            <option value="0">0%</option>
                            <option value="10">10%</option>
                            <option value="20">20%</option>
                            <option value="30">30%</option>
                            <option value="40">40%</option>
                            <option value="50">50%</option>
                            <option value="60">60%</option>
                            <option value="70">70%</option>
                            <option value="80">80%</option>
                            <option value="90">90%</option>
                            <option value="100">100%</option>
                        </select>
                    </div>

                    {role === 'manager' ? (
                        <button className="btn btn-sm btn-primary" onClick={() => navigate('/manager/add-room')}>
                            Thêm Phòng
                        </button>
                    ) : (
                        <button className="btn btn-sm btn-primary" onClick={() => navigate('/admin/add-room')}>
                            Thêm Phòng
                        </button>
                    )}
                </div>
                <p className="text-success">{messages.addMessageSuccess}</p>
                <p className="text-danger">{messages.addMessageFail}</p>
                <p className="text-success">{messages.updateMessageSuccess}</p>
                <p className="text-danger">{messages.updateMessageFail}</p>
                <p className="text-success">{messages.deleteMessageSuccess}</p>
                <p className="text-danger">{messages.deleteMessageFail}</p>
                <div className="table-responsive">
                    <table className="table text-start align-middle table-hover table-striped mb-0">
                        <thead>
                            <tr className="text-dark">
                                <th scope="col">ID</th>
                                <th scope="col">Ảnh</th>
                                <th scope="col">Tên Phòng</th>
                                <th scope="col">Số Phòng</th>
                                <th scope="col">Giá</th>
                                <th scope="col">Hạng Phòng</th>
                                <th scope="col">Giảm giá</th>
                                <th scope="col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id}>
                                    <td>{room.id}</td>
                                    <td>
                                        {room.roomImg ? (
                                            <img
                                                src={room.roomImg} // URL của ảnh
                                                alt="Room"
                                                style={{ width: '50px', height: '50px' }} // Style ảnh
                                            />
                                        ) : (
                                            'Không có ảnh'
                                        )}
                                    </td>
                                    <td>{room.name}</td>
                                    <td>{room.roomNumber}</td>
                                    <td>{room.price}</td>
                                    <td>{room.category ? room.category.name : 'Không xác định'}</td>
                                    <td>
                                        <select
                                            className="form-select"
                                            aria-label="Default select example"
                                            value={room.discount}
                                            onChange={(e) => handleDiscountChange(room.id, e.target.value)}
                                        >
                                            <option value="0">0%</option>
                                            <option value="10">10%</option>
                                            <option value="20">20%</option>
                                            <option value="30">30%</option>
                                            <option value="40">40%</option>
                                            <option value="50">50%</option>
                                            <option value="60">60%</option>
                                            <option value="70">70%</option>
                                            <option value="80">80%</option>
                                            <option value="90">90%</option>
                                            <option value="100">100%</option>
                                        </select>
                                    </td>
                                    <td>
                                        {room && (
                                            <i
                                                className="fa-solid fa-eye"
                                                style={{ color: '#007bff', cursor: 'pointer', marginRight: '10px' }}
                                                onClick={() => handleViewDetails(room.id)}
                                            ></i>
                                        )}

                                        {role === 'manager' ? (
                                            <Link to={`/manager/edit-room/${room.id}`}>
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </Link>
                                        ) : (
                                            <Link to={`/admin/edit-room/${room.id}`}>
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </Link>
                                        )}

                                        <a onClick={() => handleDeleteClick(room.id)}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-center">
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                <li className="page-item">
                                    <button className="page-link" onClick={() => setPage(0)} aria-label="Previous">
                                        <span aria-hidden="true">&laquo;</span>
                                        <span className="sr-only">Previous</span>
                                    </button>
                                </li>
                                {Array.from({ length: endPage }, (_, i) => i + 1).map((i) => (
                                    <li key={i} className="page-item">
                                        <button className="page-link" onClick={() => setPage(i - 1)}>
                                            {i}
                                        </button>
                                    </li>
                                ))}
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(endPage - 1)}
                                        aria-label="Next"
                                    >
                                        <span aria-hidden="true">&raquo;</span>
                                        <span className="sr-only">Next</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa phòng này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
            {isRoomDetailsModalVisible && (
                <RoomDetailsModal
                    isVisible={isRoomDetailsModalVisible}
                    roomId={selectedBookingId}
                    onClose={() => setIsRoomDetailsModalVisible(false)}
                />
            )}
        </div>
    );
}

export default AdminRoom;
