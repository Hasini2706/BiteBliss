package com.onlinefood.service;

import com.onlinefood.entity.Coupon;
import com.onlinefood.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.onlinefood.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon addCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    public Coupon validateCoupon(String code, BigDecimal orderTotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code"));

        if (!coupon.getActive()) {
            throw new IllegalArgumentException("Coupon is no longer active");
        }
        
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Coupon has expired");
        }
        
        if (coupon.getMaxUses() != null && coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new IllegalArgumentException("Coupon usage limit reached");
        }

        if (orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new IllegalArgumentException("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required");
        }

        return coupon;
    }
    
    public void toggleCoupon(Long id) {
        Coupon c = couponRepository.findById(id).orElseThrow();
        c.setActive(!c.getActive());
        couponRepository.save(c);
    }
}
