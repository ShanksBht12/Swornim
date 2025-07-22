import 'package:flutter/foundation.dart';
import 'dart:io';

class AppConfig {
  // Base URLs for different environments
  static const String _emulatorBaseUrl = 'http://10.0.2.2:9009/api/v1';
  // Update this IP to your current server IP for real device testing
  static const String _deviceBaseUrl = 'http://192.168.1.188:9009/api/v1'; // <-- Set to your current Wi-Fi IP
  static const String _productionBaseUrl = 'https://your-production-domain.com/api/v1';

  // Get the appropriate base URL based on environment
  static String get baseUrl {
    if (kDebugMode) {
      // For real device testing, use device URL
      // For emulator testing, use emulator URL
      return _deviceBaseUrl; // Use your server's IP for real device
      // return _emulatorBaseUrl; // Use this for emulator testing
    } else {
      // In release mode, use production URL
      return _productionBaseUrl;
    }
  }

  // Auth endpoints
  static String get authBaseUrl => '$baseUrl/auth';
  
  // Service provider endpoints
  static String get photographersUrl => '$baseUrl/photographers';
  static String get makeupArtistsUrl => '$baseUrl/makeup-artists';
  static String get decoratorsUrl => '$baseUrl/decorators';
  static String get venuesUrl => '$baseUrl/venues';
  static String get caterersUrl => '$baseUrl/caterers';
  static String get eventOrganizersUrl => '$baseUrl/event-organizers';
  
  // Booking endpoints
  static String get bookingsUrl => '$baseUrl/bookings';
  static String get packagesUrl => '$baseUrl/packages';
  
  // Payment endpoints
  static String get paymentsUrl => '$baseUrl/payments';
  
  // User endpoints
  static String get usersUrl => '$baseUrl/users';

  // Helper method to get service provider URL by type
  static String getServiceProviderUrl(String type) {
    switch (type.toLowerCase()) {
      case 'photographers':
        return photographersUrl;
      case 'makeup-artists':
        return makeupArtistsUrl;
      case 'decorators':
        return decoratorsUrl;
      case 'venues':
        return venuesUrl;
      case 'caterers':
        return caterersUrl;
      case 'event-organizers':
      case 'eventorganizers':
      case 'event_organizers':
        return eventOrganizersUrl;
      default:
        return '$baseUrl/$type';
    }
  }

  // Helper method to get service provider type from URL
  static String getServiceProviderType(String url) {
    if (url.contains('photographers')) return 'photographers';
    if (url.contains('makeup-artists')) return 'makeup-artists';
    if (url.contains('decorators')) return 'decorators';
    if (url.contains('venues')) return 'venues';
    if (url.contains('caterers')) return 'caterers';
    return 'unknown';
  }
} 