package com.onlinefood.controller;

import com.onlinefood.entity.Coupon;
import com.onlinefood.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    public ResponseEntity<Coupon> addCoupon(@RequestBody Coupon coupon) {
        return new ResponseEntity<>(couponService.addCoupon(coupon), HttpStatus.CREATED);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestParam String code, @RequestParam java.math.BigDecimal total) {
        try {
            Coupon coupon = couponService.validateCoupon(code, total);
            return ResponseEntity.ok(coupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleCoupon(@PathVariable Long id) {
        couponService.toggleCoupon(id);
        return ResponseEntity.ok().build();
    }
}
