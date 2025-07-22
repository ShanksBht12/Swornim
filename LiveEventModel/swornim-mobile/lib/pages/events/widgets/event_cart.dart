import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:swornim/pages/models/events/event.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:swornim/pages/services/event_manager.dart' as event_manager;
import '../../providers/events/client_event_provider.dart';
import '../../QRScreen/qr_ticket_screen.dart';
import '../../models/events/event_booking.dart';
import '../../payment/khalti_payment_screen.dart';
import '../../providers/payments/payment_provider.dart';
import '../../services/event_booking_manager.dart';

class EventCard extends ConsumerStatefulWidget {
  final Event event;
  final VoidCallback? onTap;
  final bool isCompact;

  const EventCard({
    Key? key,
    required this.event,
    this.onTap,
    this.isCompact = false,
  }) : super(key: key);

  @override
  ConsumerState<EventCard> createState() => _EventCardState();
}

class _EventCardState extends ConsumerState<EventCard> {
  bool _isBooking = false;
  String? _error;
  int _ticketQuantity = 1;

  int get _maxTickets => widget.event.availableTickets ?? 1;
  double get _totalPrice => (widget.event.ticketPrice ?? 0) * _ticketQuantity;

  // --- Move all helper methods here from the original StatelessWidget ---
  Widget _buildEventImage(BuildContext context, ColorScheme colorScheme) {
    final event = widget.event;
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            colorScheme.primary.withOpacity(0.8),
            colorScheme.primary.withOpacity(0.6),
          ],
        ),
      ),
      child: Stack(
        children: [
          if (event.imageUrl != null && event.imageUrl!.isNotEmpty)
            Container(
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
                image: DecorationImage(
                  image: NetworkImage(event.imageUrl!),
                  fit: BoxFit.cover,
                  colorFilter: ColorFilter.mode(
                    Colors.black.withOpacity(0.3),
                    BlendMode.multiply,
                  ),
                ),
              ),
            ),
          Container(
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withOpacity(0.7),
                ],
              ),
            ),
          ),
          Positioned(
            top: 16,
            left: 16,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                _getEventIcon(event.eventType),
                color: colorScheme.primary,
                size: 24,
              ),
            ),
          ),
          if (event.isTicketed)
            Positioned(
              top: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF059669),
                      const Color(0xFF10B981),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF059669).withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  event.ticketPriceDisplayText,
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.95),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.calendar_today_rounded,
                    color: colorScheme.primary,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _formatEventDate(event.eventDate),
                    style: GoogleFonts.inter(
                      color: colorScheme.onSurface,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEventHeader(BuildContext context, ColorScheme colorScheme) {
    final event = widget.event;
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: colorScheme.primary.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: Text(
            event.displayName,
            style: GoogleFonts.inter(
              color: colorScheme.primary,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const Spacer(),
        if (event.status != EventStatus.published)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: _getStatusColor(event.status).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              event.status.name.toUpperCase(),
              style: GoogleFonts.inter(
                color: _getStatusColor(event.status),
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildEventTitle(BuildContext context, ColorScheme colorScheme) {
    final event = widget.event;
    return Text(
      event.title,
      style: GoogleFonts.inter(
        color: colorScheme.onSurface,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        height: 1.2,
      ),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildEventDescription(BuildContext context, ColorScheme colorScheme) {
    final event = widget.event;
    return Text(
      event.description,
      style: GoogleFonts.inter(
        color: colorScheme.onSurfaceVariant,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.4,
      ),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildEventDetails(BuildContext context, ColorScheme colorScheme) {
    final event = widget.event;
    return Column(
      children: [
        _buildDetailRow(
          icon: Icons.location_on_rounded,
          text: event.venue ?? event.location?.address ?? 'Venue to be announced',
          color: colorScheme.onSurfaceVariant,
        ),
        const SizedBox(height: 8),
        _buildDetailRow(
          icon: Icons.schedule_rounded,
          text: _formatEventTime(event),
          color: colorScheme.onSurfaceVariant,
        ),
        const SizedBox(height: 8),
        if (event.maxCapacity != null)
          _buildDetailRow(
            icon: Icons.people_rounded,
            text: '${event.availableTickets} spots available',
            color: (event.availableTickets ?? 0) > 10 
                ? colorScheme.onSurfaceVariant 
                : const Color(0xFFDC2626),
          ),
      ],
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String text,
    required Color color,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: color,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.inter(
              color: color,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildEventFooter(BuildContext context, ColorScheme colorScheme) {
    return Row(
      children: [
        // Event Stats
        if (widget.event.isTicketed)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: colorScheme.surfaceVariant,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.confirmation_number_rounded,
                  size: 14,
                  color: colorScheme.primary,
                ),
                const SizedBox(width: 4),
                Text(
                  '${widget.event.availableTickets} left',
                  style: GoogleFonts.inter(
                    color: colorScheme.onSurfaceVariant,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        
        const Spacer(),
        
        // Action Button
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                colorScheme.primary,
                colorScheme.primary.withOpacity(0.8),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: colorScheme.primary.withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.event.canBeBooked ? _bookAndPay : widget.onTap,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      widget.event.canBeBooked ? 'Book Now' : 'View Details',
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.arrow_forward_rounded,
                      color: Colors.white,
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTicketQuantitySelector(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Tickets:', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(width: 8),
        IconButton(
          icon: Icon(Icons.remove),
          onPressed: _ticketQuantity > 1 ? () {
            setState(() {
              _ticketQuantity--;
            });
          } : null,
        ),
        Text('$_ticketQuantity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        IconButton(
          icon: Icon(Icons.add),
          onPressed: _ticketQuantity < _maxTickets ? () {
            setState(() {
              _ticketQuantity++;
            });
          } : null,
        ),
        const SizedBox(width: 16),
        Text('Total: NPR ${_totalPrice.toStringAsFixed(2)}', style: TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }

  IconData _getEventIcon(EventType eventType) {
    switch (eventType) {
      case EventType.concert:
        return Icons.music_note_rounded;
      case EventType.musicFestival:
        return Icons.festival_rounded;
      case EventType.dancePerformance:
        return Icons.directions_run_rounded;
      case EventType.comedy_show:
        return Icons.theater_comedy_rounded;
      case EventType.theater:
        return Icons.theaters_rounded;
      case EventType.cultural_show:
        return Icons.palette_rounded;
      case EventType.wedding:
        return Icons.favorite_rounded;
      case EventType.birthday:
        return Icons.cake_rounded;
      case EventType.anniversary:
        return Icons.celebration_rounded;
      case EventType.graduation:
        return Icons.school_rounded;
      case EventType.corporate:
        return Icons.business_rounded;
      case EventType.conference:
        return Icons.groups_rounded;
      case EventType.seminar:
        return Icons.record_voice_over_rounded;
      case EventType.workshop:
        return Icons.build_rounded;
      case EventType.product_launch:
        return Icons.rocket_launch_rounded;
      case EventType.sports_event:
        return Icons.sports_soccer_rounded;
      case EventType.charity_event:
        return Icons.volunteer_activism_rounded;
      case EventType.exhibition:
        return Icons.museum_rounded;
      case EventType.trade_show:
        return Icons.store_rounded;
      case EventType.festival_celebration:
        return Icons.festival_rounded;
      case EventType.religious_ceremony:
        return Icons.temple_buddhist_rounded;
      case EventType.party:
        return Icons.party_mode_rounded;
      default:
        return Icons.event_rounded;
    }
  }

  Color _getStatusColor(EventStatus status) {
    switch (status) {
      case EventStatus.draft:
        return const Color(0xFF64748B); // slate-500
      case EventStatus.published:
        return const Color(0xFF059669); // emerald-600
      case EventStatus.ongoing:
        return const Color(0xFF2563EB); // blue-600
      case EventStatus.completed:
        return const Color(0xFF7C3AED); // violet-600
      case EventStatus.cancelled:
        return const Color(0xFFDC2626); // red-600
    }
  }

  String _formatEventDate(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now).inDays;
    
    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Tomorrow';
    } else if (difference < 7) {
      return 'In $difference days';
    } else {
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[date.month - 1]} ${date.day}';
    }
  }

  String _formatEventTime(Event event) {
    final date = event.eventDate;
    final endDate = event.eventEndDate;
    final time = event.eventTime;
    final endTime = event.eventEndTime;
    
    String result = '';
    
    if (time != null) {
      result = time;
      if (endTime != null && endTime != time) {
        result += ' - $endTime';
      }
    }
    
    if (endDate != null && endDate != date) {
      final duration = endDate.difference(date).inDays;
      result += ' • ${duration + 1} days';
    }
    
    return result.isNotEmpty ? result : 'Time TBA';
  }

  Future<void> _bookAndPay() async {
    setState(() {
      _isBooking = true;
      _error = null;
    });
    try {
      if (_ticketQuantity > _maxTickets) {
        setState(() {
          _error = 'Not enough tickets available.';
          _isBooking = false;
        });
        return;
      }
      // 1. Book the event
      final bookingResult = await ClientEventHelper.bookEventTicket(
        ref,
        eventId: widget.event.id,
        ticketType: EventTicketType.regular, // or chosen type
        numberOfTickets: _ticketQuantity,
      );
      if (bookingResult == null || bookingResult.isError) {
        setState(() {
          _error = bookingResult?.error ?? 'Failed to book event';
          _isBooking = false;
        });
        return;
      }
      // Get the booking object or fetch it using bookingId
      EventBooking? booking = bookingResult.data;
      String? bookingId = bookingResult.bookingId;
      // If we don't have a full booking object but have bookingId, fetch it
      if (booking == null && bookingId != null) {
        final fetchResult = await ref.read(eventBookingManagerProvider).getBooking(bookingId);
        if (!fetchResult.isError && fetchResult.data != null) {
          booking = fetchResult.data!;
        }
      }
      // Handle cases where we have booking or just bookingId
      if (booking != null) {
        await _handleBookingWithFullData(booking);
      } else if (bookingId != null) {
        await _handleBookingWithIdOnly(bookingId);
      } else {
        setState(() {
          _error = 'Booking was created but we could not retrieve the details';
          _isBooking = false;
        });
      }
      // Refresh event data after booking
      if (mounted) {
        // Refresh event list providers
        ref.refresh(event_manager.publicEventsProvider({
          'eventType': widget.event.eventType,
        }));

        // Refresh event detail provider
        ref.refresh(event_manager.singleEventProvider(widget.event.id));

        setState(() {
          _ticketQuantity = 1;
        });
      }
    } catch (e, stack) {
      setState(() {
        _error = e.toString();
        _isBooking = false;
      });
    }
  }

  Future<void> _handleBookingWithFullData(EventBooking booking) async {
    // 2. If payment is required, start Khalti payment
    if (booking.paymentStatus == 'pending' && booking.totalAmount > 0) {
      await _processPayment(booking);
    } else {
      // No payment required or already paid, go directly to QR ticket
      if (mounted) {
        setState(() {
          _isBooking = false;
        });
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => QRTicketScreen(booking: booking),
          ),
        );
      }
    }
  }

  Future<void> _handleBookingWithIdOnly(String bookingId) async {
    print('[_handleBookingWithIdOnly] Called with bookingId: $bookingId');
    // Try to determine if payment is needed
    // For now, assume payment is needed if event is ticketed with price
    if (widget.event.isTicketed && widget.event.ticketPrice != null && widget.event.ticketPrice! > 0) {
      print('[_handleBookingWithIdOnly] Initializing payment for $bookingId');
      // Initialize payment with the bookingId
      final paymentNotifier = ref.read(paymentProvider.notifier);
      await paymentNotifier.initializePayment(bookingId);
      final paymentState = ref.read(paymentProvider);
      if (paymentState.paymentUrl != null) {
        print('[_handleBookingWithIdOnly] Payment URL received, launching payment screen');
        print('[_handleBookingWithIdOnly] paymentUrl: ${paymentState.paymentUrl} (${paymentState.paymentUrl.runtimeType}), bookingId: $bookingId (${bookingId.runtimeType}), amount: ${widget.event.ticketPrice} (${widget.event.ticketPrice.runtimeType})');
        if (paymentState.paymentUrl == null || bookingId == null || widget.event.ticketPrice == null) {
          setState(() {
            _error = 'Missing payment information. Please try again.';
            _isBooking = false;
          });
          print('[_handleBookingWithIdOnly] Missing payment information, aborting navigation');
          return;
        }
        final result = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => KhaltiPaymentScreen(
              paymentUrl: paymentState.paymentUrl!,
              bookingId: bookingId,
              amount: widget.event.ticketPrice!,
            ),
          ),
        );
        setState(() {
          _isBooking = false;
        });
        if (result == true) {
          print('[_handleBookingWithIdOnly] Payment successful, fetching updated booking');
          // Payment successful, try to fetch updated booking
          final updatedBookingResult = await ref.read(eventBookingManagerProvider).getBooking(bookingId);
          if (!updatedBookingResult.isError && updatedBookingResult.data != null) {
            print('[_handleBookingWithIdOnly] Updated booking fetched, navigating to QR ticket');
            if (mounted) {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => QRTicketScreen(booking: updatedBookingResult.data!),
                ),
              );
            }
          } else {
            print('[_handleBookingWithIdOnly] Could not fetch updated booking after payment');
            // Show success message even if we can't fetch the booking
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Booking and payment successful! Check your bookings page.'),
                  backgroundColor: Colors.green,
                ),
              );
            }
          }
        } else {
          print('[_handleBookingWithIdOnly] Payment was cancelled or failed');
          setState(() {
            _error = 'Payment was cancelled or failed';
          });
        }
      } else {
        print('[_handleBookingWithIdOnly] Failed to get payment URL');
        setState(() {
          _error = paymentState.error ?? 'Failed to get payment URL';
          _isBooking = false;
        });
      }
    } else {
      print('[_handleBookingWithIdOnly] No payment needed, booking successful');
      // Free event or no payment needed
      setState(() {
        _isBooking = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Booking successful! Check your bookings page.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  Future<void> _processPayment(EventBooking booking) async {
    final paymentNotifier = ref.read(paymentProvider.notifier);
    await paymentNotifier.initializePayment(booking.id);
    final paymentState = ref.read(paymentProvider);
    print('[_processPayment] paymentUrl: ${paymentState.paymentUrl} (${paymentState.paymentUrl.runtimeType}), bookingId: ${booking.id} (${booking.id.runtimeType}), amount: ${booking.totalAmount} (${booking.totalAmount.runtimeType})');
    if (paymentState.paymentUrl == null || booking.id == null || booking.totalAmount == null) {
      setState(() {
        _error = 'Missing payment information. Please try again.';
        _isBooking = false;
      });
      print('[_processPayment] Missing payment information, aborting navigation');
      return;
    }
    if (paymentState.paymentUrl != null) {
      final result = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => KhaltiPaymentScreen(
            paymentUrl: paymentState.paymentUrl!,
            bookingId: booking.id,
            amount: booking.totalAmount,
          ),
        ),
      );
      setState(() {
        _isBooking = false;
      });
      if (result == true) {
        // Payment successful, fetch updated booking
        final updatedBookingResult = await ref.read(eventBookingManagerProvider).getBooking(booking.id);
        if (!updatedBookingResult.isError && updatedBookingResult.data != null) {
          if (mounted) {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => QRTicketScreen(booking: updatedBookingResult.data!),
              ),
            );
          }
        }
      } else {
        setState(() {
          _error = 'Payment was cancelled or failed';
        });
      }
    } else {
      setState(() {
        _error = paymentState.error ?? 'Failed to get payment URL';
        _isBooking = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    print('[EventCard] eventType: ${widget.event.eventType} (${widget.event.eventType.runtimeType})');
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    return Stack(
      children: [
        // The original EventCard UI (copy from previous build)
        _buildCardContent(context),
        if (_isBooking)
          Positioned.fill(
            child: Container(
              color: Colors.black.withOpacity(0.2),
              child: const Center(child: CircularProgressIndicator()),
            ),
          ),
      ],
    );
  }

  Widget _buildCardContent(BuildContext context) {
    print('[EventCard] eventType: ${widget.event.eventType} (${widget.event.eventType.runtimeType})');
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
            spreadRadius: 0,
          ),
          BoxShadow(
            color: colorScheme.primary.withOpacity(0.05),
            blurRadius: 40,
            offset: const Offset(0, 16),
            spreadRadius: 0,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onTap,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white,
                  Colors.white.withOpacity(0.95),
                ],
              ),
              border: Border.all(
                color: colorScheme.outline.withOpacity(0.1),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Event Image Section
                _buildEventImage(context, colorScheme),
                
                // Event Content Section
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Event Type Badge and Status
                      _buildEventHeader(context, colorScheme),
                      
                      const SizedBox(height: 12),
                      
                      // Event Title
                      _buildEventTitle(context, colorScheme),
                      
                      const SizedBox(height: 8),
                      
                      // Event Description Preview
                      _buildEventDescription(context, colorScheme),
                      
                      const SizedBox(height: 16),
                      
                      // Event Details (Location, Date, Time)
                      _buildEventDetails(context, colorScheme),
                      
                      const SizedBox(height: 16),
                      
                      if (widget.event.isTicketed) ...[
                        _buildTicketQuantitySelector(context),
                        const SizedBox(height: 16),
                      ],
                      // Event Footer (Price, Capacity, Action)
                      _buildEventFooter(context, colorScheme),
                      if (_error != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Text(_error!, style: TextStyle(color: Colors.red)),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}