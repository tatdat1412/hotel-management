package com.example.demo.Service;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ReviewDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Reviews;
import com.example.demo.Entity.Rooms;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.BookingRepo;
import com.example.demo.Repository.ReviewRepo;
import com.example.demo.Repository.RoomRepo;
import com.example.demo.Repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

public interface ReviewService {
    void create (ReviewDTO reviewDTO, String token);
    void delete (int id);
    List<ReviewDTO> findReviewByRoomId (int id);

    PageDTO<List<ReviewDTO>> getAllReview (SearchDTO searchDTO);

    List<ReviewDTO> findByUserId(int id);

    List<ReviewDTO> findReviewsByRate();
    public boolean isRoomReviewed(int bookingId, int roomId);

}

@Service
class ReviewServiceImpl implements ReviewService{

    @Autowired
    RoomRepo roomRepo;
    @Autowired
    UserRepo userRepo;
    @Autowired
    ReviewRepo reviewRepo;

    @Autowired
    BookingRepo bookingRepo;

    @Autowired
    JwtTokenService jwtTokenService;

    public ReviewDTO convertToDTO(Reviews review){
        return new ModelMapper().map(review, ReviewDTO.class);


    }

    @Override
    @Transactional
    public void create(ReviewDTO reviewDTO, String token) {
        String username = jwtTokenService.getUserName(token);
        Users currentUser = userRepo.findByUsername(username);

        // Chuyển đổi ReviewDTO sang Reviews
        Reviews reviews = new ModelMapper().map(reviewDTO, Reviews.class);

        // Kiểm tra xem Booking có tồn tại trong database
        if (reviewDTO.getBooking() != null) {
            int bookingId = reviewDTO.getBooking().getId(); // Lấy ID của Booking từ DTO
            Bookings booking = bookingRepo.findById(bookingId).orElseThrow(() -> new IllegalArgumentException("Booking không tồn tại."));

            // Kiểm tra xem phòng được đánh giá có tồn tại trong booking
            if (reviewDTO.getRoom() == null || reviewDTO.getRoom().getId() == 0) {
                throw new IllegalArgumentException("Phòng cần được cung cấp để tạo review.");
            }
            int roomId = reviewDTO.getRoom().getId();
            Rooms room = roomRepo.findById(roomId)
                    .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại."));

            if (!booking.getRooms().contains(room)) {
                throw new IllegalArgumentException("Phòng không thuộc booking đã cung cấp.");
            }
            // Đặt isRate của phòng thành true
            roomRepo.save(room);

            // Liên kết review với phòng và booking
            reviews.setRoom(room);
            reviews.setBooking(booking);

        } else {
            throw new IllegalArgumentException("Booking không tồn tại.");
        }

        reviews.setUser(currentUser);

        // Lưu Review
        reviewRepo.save(reviews);
    }


    @Override
    public void delete(int id) {
        reviewRepo.deleteById(id);

    }

    @Override
    public List<ReviewDTO> findReviewByRoomId(int id) {

        return reviewRepo.findByRoomId(id).stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }

    @Override
    public PageDTO<List<ReviewDTO>> getAllReview(SearchDTO searchDTO) {
        if(searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        if(searchDTO.getCurrentPage() == null) {
            searchDTO.setCurrentPage(0);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(),searchDTO.getSize());
        Page<Reviews> page = reviewRepo.findAll(pageRequest);
        return PageDTO.<List<ReviewDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(r -> convertToDTO(r)).collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<ReviewDTO> findByUserId(int id) {
        return reviewRepo.findByUserId(id).stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }

    @Override
    public List<ReviewDTO> findReviewsByRate() {
        return reviewRepo.findReviewsByRate().stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }

    @Override
    public boolean isRoomReviewed(int bookingId, int roomId) {
        return reviewRepo.existsByBookingIdAndRoomId(bookingId, roomId);
    }
}
