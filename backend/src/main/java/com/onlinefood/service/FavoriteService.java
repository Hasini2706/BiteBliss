package com.onlinefood.service;

import com.onlinefood.entity.Favorite;
import com.onlinefood.entity.MenuItem;
import com.onlinefood.entity.User;
import com.onlinefood.repository.FavoriteRepository;
import com.onlinefood.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    public Favorite addFavorite(Long userId, Long menuItemId) {
        User user = userService.getUserById(userId);
        MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow();
        
        Favorite fav = new Favorite();
        fav.setUser(user);
        fav.setMenuItem(menuItem);
        return favoriteRepository.save(fav);
    }

    public void removeFavorite(Long id) {
        favoriteRepository.deleteById(id);
    }
}
