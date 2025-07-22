import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:swornim/pages/models/user/user.dart';
import 'package:swornim/pages/models/bookings/booking.dart';
import 'package:swornim/pages/providers/bookings/bookings_provider.dart';
import 'package:swornim/pages/serviceprovider_dashboard/dashboard_stats_provider.dart';
import 'package:swornim/pages/widgets/common/booking_card.dart';
import 'package:swornim/pages/models/user/user_types.dart';
import 'package:swornim/pages/services/event_booking_manager.dart';
import 'package:swornim/pages/services/event_manager.dart';
import 'package:swornim/pages/models/bookings/booking.dart';
import 'package:swornim/pages/models/events/event.dart';

class DashboardOverview extends ConsumerStatefulWidget {
  final User provider;
  
  const DashboardOverview({required this.provider, Key? key}) : super(key: key);

  @override
  ConsumerState<DashboardOverview> createState() => _DashboardOverviewState();
}

class _DashboardOverviewState extends ConsumerState<DashboardOverview>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
    ));
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.2, 0.8, curve: Curves.easeOut),
    ));
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isEventOrganizer = widget.provider.userType == UserType.eventOrganizer;

    AsyncValue<BookingsState> bookingsStateAsync;
    DashboardStats dashboardStats;

    if (isEventOrganizer) {
      bookingsStateAsync = ref.watch(_organizerBookingsStateProvider);
      dashboardStats = ref.watch(_organizerDashboardStatsProvider);
    } else {
      // For non-organizers, bookingsProvider is synchronous
      bookingsStateAsync = AsyncData(ref.watch(bookingsProvider));
      dashboardStats = ref.watch(dashboardStatsProvider);
    }

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            colorScheme.background,
            colorScheme.surface.withOpacity(0.8),
          ],
        ),
      ),
      child: RefreshIndicator(
        onRefresh: () async {
          if (isEventOrganizer) {
            ref.refresh(_organizerBookingsStateProvider);
            ref.refresh(_organizerDashboardStatsProvider);
          } else {
            ref.refresh(bookingsProvider);
            ref.refresh(dashboardStatsProvider);
          }
        },
        color: colorScheme.primary,
        child: bookingsStateAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => Center(child: Text('Error: $err')),
          data: (bookingsState) => SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Enhanced Welcome Hero Section
                    _buildEnhancedWelcomeSection(theme, colorScheme),
                    const SizedBox(height: 24),

                    // Business Performance Overview
                    _buildBusinessPerformanceSection(theme, colorScheme, dashboardStats),
                    const SizedBox(height: 24),

                    // Key Performance Indicators
                    _buildKPISection(theme, colorScheme, dashboardStats),
                    const SizedBox(height: 24),

                    // Today's Schedule
                    _buildTodaysSchedule(theme, colorScheme, bookingsState),
                    const SizedBox(height: 24),

                    // Action Items & Quick Actions
                    _buildActionItemsSection(theme, colorScheme, bookingsState),
                    const SizedBox(height: 24),

                    // Recent Activity Feed
                    _buildRecentActivityFeed(theme, colorScheme, bookingsState),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEnhancedWelcomeSection(ThemeData theme, ColorScheme colorScheme) {
    final hour = DateTime.now().hour;
    String greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    String motivationalText = _getMotivationalText();

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF2563EB), // primary-600
            Color(0xFF7C3AED), // violet-600
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2563EB).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background Pattern
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.1),
              ),
            ),
          ),
          Positioned(
            right: 40,
            bottom: -10,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.05),
              ),
            ),
          ),
          
          // Content
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$greeting,',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: Colors.white.withOpacity(0.9),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.provider.name,
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        motivationalText,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withOpacity(0.85),
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 20),
                      
                      // Quick Action Button
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.3),
                          ),
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              // Navigate to analytics or create package
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 10,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.trending_up,
                                    color: Colors.white,
                                    size: 18,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'View Analytics',
                                    style: theme.textTheme.labelMedium?.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Avatar with Status Indicator
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white.withOpacity(0.3),
                      width: 3,
                    ),
                  ),
                  child: Stack(
                    children: [
                      CircleAvatar(
                        radius: 32,
                        backgroundColor: Colors.white.withOpacity(0.2),
                        child: Icon(
                          Icons.business_center,
                          color: Colors.white,
                          size: 28,
                        ),
                      ),
                      Positioned(
                        right: 0,
                        bottom: 4,
                        child: Container(
                          width: 16,
                          height: 16,
                          decoration: BoxDecoration(
                            color: Colors.green,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white,
                              width: 2,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBusinessPerformanceSection(ThemeData theme, ColorScheme colorScheme, DashboardStats stats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF7C3AED)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.analytics,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Business Performance',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        Row(
          children: [
            Expanded(
              child: _buildPerformanceCard(
                theme,
                colorScheme,
                'Total Revenue',
                '\$${stats.monthlyEarnings.toStringAsFixed(0)}',
                '+12.5%',
                'vs last month',
                Icons.account_balance_wallet,
                Colors.green,
                true,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildPerformanceCard(
                theme,
                colorScheme,
                'Booking Rate',
                '${_calculateBookingRate(stats)}%',
                '+3.2%',
                'vs last week',
                Icons.event_available,
                Colors.blue,
                true,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPerformanceCard(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String value,
    String change,
    String period,
    IconData icon,
    Color color,
    bool isPositive,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isPositive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isPositive ? Icons.trending_up : Icons.trending_down,
                      size: 12,
                      color: isPositive ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      change,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: isPositive ? Colors.green : Colors.red,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            period,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKPISection(ThemeData theme, ColorScheme colorScheme, DashboardStats stats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.dashboard_customize,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Key Performance Indicators',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.0,
          children: [
            _buildKPICard(
              theme,
              colorScheme,
              'Active Bookings',
              '${stats.totalBookings}',
              Icons.event_note,
              const Color(0xFF2563EB),
              '3 this week',
            ),
            _buildKPICard(
              theme,
              colorScheme,
              'Pending Requests',
              '${stats.pendingRequests}',
              Icons.pending_actions,
              Colors.orange,
              'Require attention',
            ),
            _buildKPICard(
              theme,
              colorScheme,
              'Client Satisfaction',
              '4.9',
              Icons.star_rate,
              Colors.amber,
              'Average rating',
            ),
            _buildKPICard(
              theme,
              colorScheme,
              'Completion Rate',
              '${_calculateCompletionRate(stats)}%',
              Icons.check_circle,
              Colors.green,
              'This month',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKPICard(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String value,
    IconData icon,
    Color color,
    String subtitle,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  color.withOpacity(0.1),
                  color.withOpacity(0.05),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const Spacer(),
          Text(
            value,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              color: colorScheme.onSurface,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTodaysSchedule(ThemeData theme, ColorScheme colorScheme, BookingsState bookingsState) {
    final todaysBookings = bookingsState.bookings
        .where((booking) => _isToday(booking.eventDate))
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF7C3AED), Color(0xFF8B5CF6)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.today,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Today\'s Schedule',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
              ),
            ),
            TextButton.icon(
              onPressed: () {
                // Navigate to calendar view
              },
              icon: const Icon(Icons.calendar_month, size: 16),
              label: const Text('View Calendar'),
              style: TextButton.styleFrom(
                foregroundColor: colorScheme.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        if (todaysBookings.isEmpty)
          _buildEmptyScheduleCard(theme, colorScheme)
        else
          Container(
            decoration: BoxDecoration(
              color: colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: colorScheme.outline.withOpacity(0.1),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: todaysBookings.asMap().entries.map((entry) {
                final index = entry.key;
                final booking = entry.value;
                final isLast = index == todaysBookings.length - 1;
                
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: isLast ? null : Border(
                      bottom: BorderSide(
                        color: colorScheme.outline.withOpacity(0.1),
                      ),
                    ),
                  ),
                  child: _buildScheduleItem(theme, colorScheme, booking),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildEmptyScheduleCard(ThemeData theme, ColorScheme colorScheme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              Icons.free_breakfast,
              color: colorScheme.primary,
              size: 32,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No events today',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Enjoy your free time or plan ahead!',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleItem(ThemeData theme, ColorScheme colorScheme, Booking booking) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 48,
          decoration: BoxDecoration(
            color: _getStatusColor(booking.status),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 16),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: _getStatusColor(booking.status).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            _getServiceTypeIcon(booking.serviceType),
            color: _getStatusColor(booking.status),
            size: 20,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                booking.eventType,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '${booking.eventTime} • ${booking.eventLocation}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              booking.formattedAmount,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.primary,
              ),
            ),
            const SizedBox(height: 2),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: _getStatusColor(booking.status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                booking.status.name.toUpperCase(),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: _getStatusColor(booking.status),
                  fontWeight: FontWeight.w600,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionItemsSection(ThemeData theme, ColorScheme colorScheme, BookingsState bookingsState) {
    final pendingActions = _getPendingActions(bookingsState);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.orange, Colors.deepOrange],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.notification_important,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Action Required',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
              ),
            ),
            if (pendingActions.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${pendingActions.length}',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        
        if (pendingActions.isEmpty)
          _buildNoActionsCard(theme, colorScheme)
        else
          Column(
            children: pendingActions.map((action) => 
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: _buildActionCard(theme, colorScheme, action),
              ),
            ).toList(),
          ),
      ],
    );
  }

  Widget _buildNoActionsCard(ThemeData theme, ColorScheme colorScheme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.check_circle_outline,
              color: Colors.green,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'All caught up!',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'No pending actions required at this time.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(ThemeData theme, ColorScheme colorScheme, Map<String, dynamic> action) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: action['urgent'] ? Colors.red.withOpacity(0.3) : colorScheme.outline.withOpacity(0.1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: action['color'].withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              action['icon'],
              color: action['color'],
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child:                         Text(
                        action['title'],
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: colorScheme.onSurface,
                        ),
                      ),
                    ),
                    if (action['urgent'])
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'URGENT',
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                            fontSize: 9,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  action['description'],
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [action['color'], action['color'].withOpacity(0.8)],
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: action['onTap'],
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Icon(
                    Icons.arrow_forward,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivityFeed(ThemeData theme, ColorScheme colorScheme, BookingsState bookingsState) {
    final recentActivities = _getRecentActivities(bookingsState);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF8B5CF6), Color(0xFFA78BFA)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.history,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Recent Activity',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
              ),
            ),
            TextButton.icon(
              onPressed: () {
                // Navigate to full activity log
              },
              icon: const Icon(Icons.timeline, size: 16),
              label: const Text('View All'),
              style: TextButton.styleFrom(
                foregroundColor: colorScheme.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        if (recentActivities.isEmpty)
          _buildEmptyActivityCard(theme, colorScheme)
        else
          Container(
            decoration: BoxDecoration(
              color: colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: colorScheme.outline.withOpacity(0.1),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: recentActivities.asMap().entries.map((entry) {
                final index = entry.key;
                final activity = entry.value;
                final isLast = index == recentActivities.length - 1;
                
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: isLast ? null : Border(
                      bottom: BorderSide(
                        color: colorScheme.outline.withOpacity(0.1),
                      ),
                    ),
                  ),
                  child: _buildActivityItem(theme, colorScheme, activity),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildEmptyActivityCard(ThemeData theme, ColorScheme colorScheme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              Icons.timeline,
              color: colorScheme.primary,
              size: 32,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No recent activity',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Activity will appear here as you manage bookings',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem(ThemeData theme, ColorScheme colorScheme, Map<String, dynamic> activity) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: activity['color'].withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Icon(
            activity['icon'],
            color: activity['color'],
            size: 20,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                activity['title'],
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                activity['description'],
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        Text(
          activity['time'],
          style: theme.textTheme.bodySmall?.copyWith(
            color: colorScheme.onSurfaceVariant.withOpacity(0.7),
          ),
        ),
      ],
    );
  }

  // Helper Methods
  String _getMotivationalText() {
    final motivationalTexts = [
      'Ready to make today amazing? Let\'s grow your business together!',
      'Your dedication is paying off. Keep up the excellent work!',
      'Every booking is a new opportunity to shine. You\'ve got this!',
      'Building something great takes time. You\'re on the right track!',
      'Your customers love what you do. Keep exceeding expectations!',
    ];
    
    return motivationalTexts[DateTime.now().day % motivationalTexts.length];
  }

  int _calculateBookingRate(DashboardStats stats) {
    // Calculate booking acceptance rate (mock calculation)
    if (stats.totalBookings == 0) return 0;
    return ((stats.totalBookings / (stats.totalBookings + stats.pendingRequests)) * 100).round();
  }

  int _calculateCompletionRate(DashboardStats stats) {
    if (stats.totalBookings == 0) return 0;
    final completed = stats.statusBreakdown[BookingStatus.completed] ?? 0;
    return ((completed / stats.totalBookings) * 100).round();
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  List<Map<String, dynamic>> _getPendingActions(BookingsState bookingsState) {
    List<Map<String, dynamic>> actions = [];
    
    // Check for pending booking requests
    final pendingBookings = bookingsState.bookings
        .where((b) => b.status == BookingStatus.pending_provider_confirmation)
        .length;
    
    if (pendingBookings > 0) {
      actions.add({
        'title': 'Review Booking Requests',
        'description': '$pendingBookings new booking requests need your attention',
        'icon': Icons.pending_actions,
        'color': Colors.orange,
        'urgent': pendingBookings > 3,
        'onTap': () {
          // Navigate to bookings management
        },
      });
    }

    // Check for incomplete profile
    actions.add({
      'title': 'Complete Your Profile',
      'description': 'Add more photos and services to attract clients',
      'icon': Icons.person_outline,
      'color': const Color(0xFF2563EB),
      'urgent': false,
      'onTap': () {
        // Navigate to profile management
      },
    });

    // Check for package optimization
    actions.add({
      'title': 'Optimize Package Pricing',
      'description': 'Review your pricing strategy to maximize revenue',
      'icon': Icons.trending_up,
      'color': Colors.green,
      'urgent': false,
      'onTap': () {
        // Navigate to package management
      },
    });

    return actions.take(3).toList(); // Limit to 3 actions
  }

  List<Map<String, dynamic>> _getRecentActivities(BookingsState bookingsState) {
    List<Map<String, dynamic>> activities = [];
    
    // Generate mock recent activities based on bookings
    final recentBookings = bookingsState.bookings
        .where((b) => DateTime.now().difference(b.createdAt).inDays < 7)
        .take(5);
    
    for (final booking in recentBookings) {
      activities.add({
        'title': 'New booking received',
        'description': '${booking.eventType} for ${booking.formattedEventDate}',
        'icon': Icons.event_note,
        'color': Colors.green,
        'time': _formatTimeAgo(booking.createdAt),
      });
    }

    // Add some default activities if none exist
    if (activities.isEmpty) {
      activities.addAll([
        {
          'title': 'Profile updated',
          'description': 'Added new portfolio images',
          'icon': Icons.photo_camera,
          'color': const Color(0xFF2563EB),
          'time': '2 hours ago',
        },
        {
          'title': 'Package created',
          'description': 'New "Premium Wedding" package added',
          'icon': Icons.inventory,
          'color': Colors.purple,
          'time': '1 day ago',
        },
        {
          'title': 'Review received',
          'description': '5-star review from Sarah Johnson',
          'icon': Icons.star,
          'color': Colors.amber,
          'time': '3 days ago',
        },
      ]);
    }

    return activities;
  }

  String _formatTimeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
    } else {
      return 'Just now';
    }
  }

  IconData _getServiceTypeIcon(ServiceType serviceType) {
    switch (serviceType) {
      case ServiceType.photography:
        return Icons.camera_alt;
      case ServiceType.makeup:
        return Icons.face;
      case ServiceType.decoration:
        return Icons.celebration;
      case ServiceType.venue:
        return Icons.location_on;
      case ServiceType.catering:
        return Icons.restaurant;
      case ServiceType.music:
        return Icons.music_note;
      case ServiceType.planning:
        return Icons.event_note;
    }
  }

  Color _getStatusColor(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending_provider_confirmation:
      case BookingStatus.pending_modification:
      case BookingStatus.modification_requested:
        return Colors.orange.shade600;
      case BookingStatus.confirmed_awaiting_payment:
      case BookingStatus.confirmed_paid:
        return Colors.blue.shade600;
      case BookingStatus.in_progress:
        return Colors.purple.shade600;
      case BookingStatus.completed:
        return Colors.green.shade600;
      case BookingStatus.cancelled_by_client:
      case BookingStatus.cancelled_by_provider:
        return Colors.red.shade600;
      case BookingStatus.rejected:
        return Colors.red.shade600;
      case BookingStatus.dispute_raised:
        return Colors.orange.shade600;
      case BookingStatus.dispute_resolved:
      case BookingStatus.refunded:
        return Colors.grey.shade600;
    }
  }
}

// Provider to fetch all events for the current organizer
final _organizerEventsProvider = FutureProvider<List<Event>>((ref) async {
  final events = await ref.watch(myEventsProvider({}).future);
  return events;
});

// Provider to aggregate all bookings for all events organized by the current organizer
final _organizerBookingsStateProvider = FutureProvider<BookingsState>((ref) async {
  final events = await ref.watch(_organizerEventsProvider.future);
  List<Booking> allBookings = [];
  if (events != null) {
    for (final event in events) {
      final data = await ref.read(paginatedEventBookingDetailsProvider({
        'eventId': event.id,
        'page': 1,
        'limit': 100,
      }).future);
      final results = data['results'] as List<dynamic>?;
      if (results != null) {
        allBookings.addAll(results.map((json) => Booking.fromJson(json)).toList());
      }
    }
  }
  return BookingsState(bookings: allBookings, isLoading: false);
});

final _organizerDashboardStatsProvider = Provider<DashboardStats>((ref) {
  final bookingsAsync = ref.watch(_organizerBookingsStateProvider);
  if (bookingsAsync is AsyncData<BookingsState>) {
    return DashboardStats.fromBookings(bookingsAsync.value.bookings);
  }
  return DashboardStats.fromBookings([]);
});