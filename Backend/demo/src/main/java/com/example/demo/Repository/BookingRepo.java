package com.example.demo.Repository;

import com.example.demo.DTO.CountBookingsFromDateDTO;
import com.example.demo.DTO.MostBookedRoomsDTO;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

public interface BookingRepo extends JpaRepository<Bookings, Integer> {

    @Modifying
    @Transactional
    @Query("UPDATE Bookings b SET b.status = :bookingStatus WHERE b.id = :bookingId")
    void updateStatus(@Param("bookingStatus") boolean status,@Param("bookingId") Integer id);

    @Query("SELECT b FROM Bookings b JOIN b.rooms r WHERE r.id = :roomId AND :checkinDate < b.checkOutDate AND :checkoutDate > b.checkInDate AND b.bookingStatus <> 'Đã hủy'")
    List<Bookings> checkBooked(@Param("roomId") int roomId,
                               @Param("checkinDate") Date checkinDate,
                               @Param("checkoutDate") Date checkoutDate);

    // Statistics by date

    @Query("SELECT new com.example.demo.DTO.CountBookingsFromDateDTO( " +
            "DATE(b.createAt), " +
            "COUNT(b.id), " +
            "SUM(CASE WHEN b.bookingStatus <> 'Đã hủy' THEN b.totalAmount ELSE 0 END), " +
            "SUM(CASE WHEN b.bookingStatus = 'Đã hủy' THEN 1 ELSE 0 END)) " +
            "FROM Bookings b " +
            "WHERE b.createAt BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(b.createAt) " +
            "ORDER BY DATE(b.createAt)")
    List<CountBookingsFromDateDTO> countBookingsFromDate(
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate);



    @Query("SELECT new com.example.demo.DTO.CountBookingsFromDateDTO( " +
            "CURRENT_DATE, " +  // current date
            "COUNT(b.id), " +   // total count of bookings
            "SUM(CASE WHEN b.bookingStatus <> 'Đã hủy' THEN b.totalAmount ELSE 0 END), " +  // sum of total amount excluding canceled bookings
            "SUM(CASE WHEN b.bookingStatus = 'Đã hủy' THEN 1 ELSE 0 END)) " +  // count of canceled bookings
            "FROM Bookings b " +
            "WHERE DATE(b.createAt) = CURRENT_DATE")  // filter by today's date
    CountBookingsFromDateDTO statisticsDay();
    @Query("SELECT new com.example.demo.DTO.CountBookingsFromDateDTO(CURRENT_DATE, COUNT(b), SUM(b.totalAmount)) " +
            "FROM Bookings b " +
            "WHERE b.bookingStatus <> 'Đã hủy'")
    CountBookingsFromDateDTO countAllBookings();


    @Query("SELECT b FROM Bookings b WHERE b.user.id = :userId")
    List<Bookings> getBookingsByUserId (@Param("userId") int userId);
    @Query("SELECT b FROM Bookings b JOIN FETCH b.rooms WHERE b.id = :bookingId")
    Bookings findByIdWithRooms(@Param("bookingId") int bookingId);

    @Query("SELECT new com.example.demo.DTO.MostBookedRoomsDTO (r.id,r.roomImg, r.name, r.roomNumber, r.price, COUNT(r.id)) " +
            "FROM Bookings b " +
            "JOIN b.rooms r " +
            "WHERE b.bookingStatus = 'Hoàn thành' " +
            "AND b.createAt BETWEEN :startDate AND :endDate " +
            "GROUP BY r.id, r.name, r.roomImg, r.roomNumber, r.price " +
            "ORDER BY COUNT(r.id) DESC")
    Page<MostBookedRoomsDTO> findMostBookedRooms(@Param("startDate") Date startDate,
                                                            @Param("endDate") Date endDate,
                                                            Pageable pageable);

    @Query("SELECT new com.example.demo.DTO.MostBookedRoomsDTO (r.id,r.roomImg, r.name, r.roomNumber, r.price, COUNT(r.id)) " +
            "FROM Bookings b " +
            "JOIN b.rooms r " +
            "WHERE b.bookingStatus = 'Hoàn thành' " +
            "GROUP BY r.id, r.name, r.roomImg, r.roomNumber, r.price " +
            "ORDER BY COUNT(r.id) DESC")
    Page<MostBookedRoomsDTO> findAllMostBookedRooms(Pageable pageable);
    @Query("SELECT new com.example.demo.DTO.MostBookedRoomsDTO (r.id,r.roomImg, r.name, r.roomNumber, r.price, COUNT(r.id) ) " +
            "FROM Bookings b " +
            "JOIN b.rooms r " +
            "WHERE b.bookingStatus = 'Hoàn thành' AND r.capacity >= :count " +
            "GROUP BY r.id, r.name, r.roomImg, r.roomNumber, r.price " +
            "ORDER BY COUNT(r.id) DESC")
    Page<MostBookedRoomsDTO> findAllMostBookedRoomsByCapacity(@Param("count") int count, Pageable pageable);



    @Query("SELECT new com.example.demo.DTO.MostBookedRoomsDTO (r.id,r.roomImg, r.name, r.roomNumber, r.price, COUNT(r.id)) " +
            "FROM Bookings b " +
            "JOIN b.rooms r " +
            "WHERE b.bookingStatus = 'Hoàn thành' " +
            "GROUP BY r.id, r.name " +
            "ORDER BY COUNT(r.id) ASC")
    Page<MostBookedRoomsDTO> findMinBookedRooms(Pageable pageable);

//    @Query(value = "SELECT AVG(TIMESTAMPDIFF(MINUTE, b.create_at , b.update_at)) " +
//            "FROM Bookings b " +
//            "WHERE b.employee_id = :employeeId "+
//            "AND b.create_at BETWEEN :startDate AND :endDate " +
//            "AND b.booking_status = 'Đã xác nhận'",
//            nativeQuery = true)
//    Double averageProcessingTime(@Param("employeeId") int employeeId,@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query(value = "SELECT AVG(TIMESTAMPDIFF(MINUTE, b.create_at, h.updated_at)) " +
            "FROM bookings b " +
            "JOIN booking_status_history h ON b.id = h.booking_id " +
            "WHERE b.employee_id = :employeeId " +
            "AND b.create_at IS NOT NULL " +
            "AND h.updated_at IS NOT NULL " +
            "AND h.status = 'Đã xác nhận' " +
            "AND b.create_at BETWEEN :startDate AND :endDate",
            nativeQuery = true)
    Double averageProcessingTime(@Param("employeeId") int employeeId,
                                 @Param("startDate") Date startDate,
                                 @Param("endDate") Date endDate);



    @Query("SELECT COUNT(b) FROM Bookings b " +
            "WHERE b.employee.id = :employeeId " +
            "AND b.createAt BETWEEN :startDate AND :endDate " +
            "AND b.bookingStatus IN ('Đã xác nhận', 'Hoàn thành')")
    int countSuccessfulBookings(@Param("employeeId") int employeeId,
                                @Param("startDate") Date startDate,
                                @Param("endDate") Date endDate);

    @Query("SELECT COUNT(b) FROM Bookings b " +
            "WHERE b.employee.id = :employeeId " +
            "AND b.createAt BETWEEN :startDate AND :endDate")
    int countTotalBookings(@Param("employeeId") int employeeId,
                           @Param("startDate") Date startDate,
                           @Param("endDate") Date endDate);

    @Query("SELECT COUNT(b) FROM Bookings b WHERE b.employee.id = :employeeId " +
            "AND b.createAt BETWEEN :startDate AND :endDate " +
            "AND b.bookingStatus = 'Đã hủy'")
    int countCanceledBookings(@Param("employeeId") int employeeId,
                              @Param("startDate") Date startDate,
                              @Param("endDate") Date endDate);

    @Query("SELECT SUM(b.totalAmount) " +
            "FROM Bookings b " +
            "WHERE b.employee.id = :employeeId " +
            "AND b.createAt BETWEEN :startDate AND :endDate " +
            "AND b.bookingStatus <> 'Đã hủy'")
    Double revenue(@Param("employeeId") int employeeId,
                   @Param("startDate") Date startDate,
                   @Param("endDate") Date endDate);

    @Modifying
    @Transactional
    @Query("UPDATE Bookings b SET b.employee = :employee WHERE b.id = :bookingId")
    void updateEmployee(@Param("bookingId") int bookingId, @Param("employee") Users employee);

    // lấy ra các booking mà employee đăng nhập phụ trách
    @Query("SELECT b FROM Bookings b WHERE b.employee.id =:employeeId")
    Page<Bookings> searchBookingsByEmployee (Pageable pageable, @Param("employeeId") int employeeId);
    @Query("SELECT b FROM Bookings b WHERE b.employee.id =:employeeId")
    List<Bookings> getAllBookingsByEmployee (@Param("employeeId") int employeeId);

}