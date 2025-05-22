import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function Sidebar() {
    const [data, setData] = useState({
        avatar: '/admin/img/mng-avatar.png', // Default avatar if no actual URL
        username: 'Admin', // Default username if no actual data
    });
    const location = useLocation();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token'); // Assuming the token is saved in localStorage

            if (!token) {
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Update state with values from API
                setData({
                    avatar: response.data.avatar || '/admin/img/mng-avatar.png', // Default avatar if needed
                    username: response.data.username || 'Admin', // Default username if needed
                });
            } catch (error) {
                console.error('Error fetching user info:', error);
                // Optionally handle error, e.g., set error state
            }
        };

        fetchUserInfo();
    }, []);
    return (
        <div className="sidebar pe-4 pb-3">
            <nav className="navbar bg-light navbar-light">
                <Link to="/admin/" className="navbar-brand mx-4 mb-3">
                    <h3 className="text-primary">
                        <i class="fa-solid fa-landmark"></i> St Berry
                    </h3>
                </Link>
                <div className="d-flex align-items-center ms-4 mb-4">
                    <div className="position-relative">
                        <img
                            className="rounded-circle"
                            src={data.avatar}
                            alt="User Avatar"
                            style={{ width: '40px', height: '40px' }}
                        />
                        <div className="bg-success rounded-circle border border-2 border-white position-absolute end-0 bottom-0 p-1"></div>
                    </div>
                    <div className="ms-3">
                        <h6 className="mb-0">{data.username}</h6>
                        <span>Admin</span>
                    </div>
                </div>
                <div className="navbar-nav w-100">
                    <Link
                        to="/manager"
                        className={`nav-item nav-link ${location.pathname === '/manager' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-chart-simple me-2"></i>Thống kê
                    </Link>

                    <Link
                        to="/manager/category"
                        className={`nav-item nav-link ${location.pathname === '/manager/category' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-list"></i>Danh mục
                    </Link>
                    <Link
                        to="/manager/room"
                        className={`nav-item nav-link ${location.pathname === '/manager/room' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-hotel"></i>Phòng
                    </Link>
                    <Link
                        to="/manager/booking"
                        className={`nav-item nav-link ${location.pathname === '/manager/booking' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-cart-shopping me-2"></i>Đặt phòng
                    </Link>
                    <Link
                        to="/manager/payment"
                        className={`nav-item nav-link ${location.pathname === '/manager/payment' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-money-check-dollar"></i>Thanh Toán
                    </Link>

                    <Link
                        to="/manager/contact"
                        className={`nav-item nav-link ${location.pathname === '/manager/contact' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-paper-plane me-2"></i>Liên hệ
                    </Link>

                    <Link
                        to="/manager/review"
                        className={`nav-item nav-link ${location.pathname === '/manager/review' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-comment me-2"></i>Đánh giá
                    </Link>
                    <Link
                        to="/manager/user"
                        className={`nav-item nav-link ${location.pathname === '/manager/user' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-user me-2"></i>Người dùng
                    </Link>
                    <Link
                        to="/manager/employee"
                        className={`nav-item nav-link ${location.pathname === '/manager/employee' ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-people-roof"></i>Nhân viên
                    </Link>
                    {/* Uncomment the following line and add necessary logic for loginInfo */}
                    {/* <Link to="/user/1" className="nav-item nav-link"><i className="fa fa-th me-2"></i>User</Link> */}
                </div>
            </nav>
        </div>
    );
}

export default Sidebar;
