package com.onlinefood.service;

import com.onlinefood.entity.Address;
import com.onlinefood.entity.User;
import com.onlinefood.repository.AddressRepository;
import com.onlinefood.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private UserService userService;

    public List<Address> getAddressesByUserId(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        if (addresses.isEmpty()) {
            try {
                User user = userService.getUserById(userId);
                if (user != null) {
                    Address defaultAddr = new Address(null, user, user.getName(), user.getPhone() != null ? user.getPhone() : "9876543210",
                            "Flat 402, Royal Palms, Gachibowli", "Near Bio-Diversity Park", "Hyderabad", "Telangana", "500032", "Home");
                    addressRepository.save(defaultAddr);
                    addresses = addressRepository.findByUserId(userId);
                }
            } catch (Exception ignored) {}
        }
        return addresses;
    }

    public List<Address> getAddressesByUser(Long userId) {
        return getAddressesByUserId(userId);
    }

    public Address getAddressById(Long id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
    }

    public Address addAddress(Long userId, Address address) {
        User user = userService.getUserById(userId);
        address.setUser(user);
        return addressRepository.save(address);
    }

    public void deleteAddress(Long id) {
        addressRepository.deleteById(id);
    }
}
