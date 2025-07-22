import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:swornim/pages/models/user/user.dart';
import 'package:swornim/pages/models/bookings/booking.dart';
import 'package:swornim/pages/providers/bookings/bookings_provider.dart';
import 'package:swornim/pages/serviceprovider_dashboard/dashboard_stats_provider.dart';

class RevenueAnalytics extends ConsumerWidget {
  final User provider;
  
  const RevenueAnalytics({required this.provider, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final bookingsState = ref.watch(bookingsProvider);
    final dashboardStats = ref.watch(dashboardStatsProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Revenue Overview Cards
          _buildRevenueOverview(theme, colorScheme, dashboardStats),
          const SizedBox(height: 24),

          // Revenue Chart
          _buildRevenueChart(theme, colorScheme, bookingsState.bookings),
          const SizedBox(height: 24),

          // Payment Status Breakdown
          _buildPaymentBreakdown(theme, colorScheme, dashboardStats),
          const SizedBox(height: 24),

          // Analytics Insights
          _buildAnalyticsInsights(theme, colorScheme, bookingsState.bookings),
          const SizedBox(height: 24),

          // Top Performing Packages
          _buildTopPackages(theme, colorScheme, bookingsState.bookings),
        ],
      ),
    );
  }

  Widget _buildRevenueOverview(ThemeData theme, ColorScheme colorScheme, DashboardStats stats) {
    final currentMonth = DateTime.now().month;
    final lastMonth = currentMonth == 1 ? 12 : currentMonth - 1;
    final currentYear = DateTime.now().year;
    final lastYear = currentMonth == 1 ? currentYear - 1 : currentYear;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Revenue Overview',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: colorScheme.onSurface,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildRevenueCard(
                theme,
                colorScheme,
                'This Month',
                '\$${stats.monthlyEarnings.toStringAsFixed(0)}',
                Icons.trending_up,
                Colors.green,
                '+12.5%',
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildRevenueCard(
                theme,
                colorScheme,
                'Last Month',
                '\$${(stats.monthlyEarnings * 0.88).toStringAsFixed(0)}',
                Icons.trending_down,
                Colors.orange,
                '-5.2%',
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildRevenueCard(
                theme,
                colorScheme,
                'Total Bookings',
                '${stats.totalBookings}',
                Icons.calendar_today,
                colorScheme.primary,
                '+8.3%',
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildRevenueCard(
                theme,
                colorScheme,
                'Avg. Booking Value',
                '\$${(stats.totalBookings > 0 ? stats.monthlyEarnings / stats.totalBookings : 0).toStringAsFixed(0)}',
                Icons.attach_money,
                colorScheme.secondary,
                '+15.7%',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRevenueCard(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String value,
    IconData icon,
    Color color,
    String change,
  ) {
    final isPositive = change.startsWith('+');
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
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
                child: Icon(
                  icon,
                  color: color,
                  size: 20,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isPositive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  change,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: isPositive ? Colors.green : Colors.red,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRevenueChart(ThemeData theme, ColorScheme colorScheme, List<Booking> bookings) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Revenue Trend (Last 6 Months)',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: _buildSimpleChart(bookings, theme, colorScheme),
          ),
        ],
      ),
    );
  }

  Widget _buildSimpleChart(List<Booking> bookings, ThemeData theme, ColorScheme colorScheme) {
    // Generate sample data for the last 6 months
    final months = List.generate(6, (index) {
      final date = DateTime.now().subtract(Duration(days: 30 * (5 - index)));
      return date;
    });

    final revenueData = months.map((month) {
      final monthBookings = bookings.where((booking) {
        return booking.createdAt.year == month.year &&
               booking.createdAt.month == month.month &&
               booking.isPaid;
      }).toList();
      
      return monthBookings.fold(0.0, (sum, booking) => sum + booking.totalAmount);
    }).toList();

    final maxRevenue = revenueData.reduce((a, b) => a > b ? a : b);
    final minRevenue = revenueData.reduce((a, b) => a < b ? a : b);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: months.asMap().entries.map((entry) {
        final index = entry.key;
        final month = entry.value;
        final revenue = revenueData[index];
        final height = maxRevenue > 0 ? (revenue / maxRevenue) : 0.0;

        return Expanded(
          child: Column(
            children: [
              Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        colorScheme.primary,
                        colorScheme.primary.withOpacity(0.7),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  height: height * 120, // Max height of 120
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _getMonthAbbreviation(month.month),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              Text(
                '\$${revenue.toStringAsFixed(0)}',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.onSurface,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPaymentBreakdown(ThemeData theme, ColorScheme colorScheme, DashboardStats stats) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payment Status Breakdown',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          ...stats.paymentBreakdown.entries.map((entry) {
            final status = entry.key;
            final count = entry.value;
            final percentage = stats.totalBookings > 0 
                ? (count / stats.totalBookings * 100).toStringAsFixed(1)
                : '0.0';

            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: _getPaymentStatusColor(status),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      status.name.toUpperCase(),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurface,
                      ),
                    ),
                  ),
                  Text(
                    '$count ($percentage%)',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildAnalyticsInsights(ThemeData theme, ColorScheme colorScheme, List<Booking> bookings) {
    final insights = _calculateInsights(bookings);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Analytics Insights',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          ...insights.map((insight) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Icon(
                  insight['icon'] as IconData,
                  color: insight['color'] as Color,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        insight['title'] as String,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        insight['description'] as String,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  insight['value'] as String,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: insight['color'] as Color,
                  ),
                ),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildTopPackages(ThemeData theme, ColorScheme colorScheme, List<Booking> bookings) {
    final packageStats = _calculatePackageStats(bookings);
    final topPackages = packageStats.entries
        .toList()
        ..sort((a, b) => b.value['revenue'].compareTo(a.value['revenue']));

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Top Performing Packages',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          ...topPackages.take(5).map((entry) {
            final packageName = entry.key;
            final stats = entry.value;

            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.star,
                      color: colorScheme.primary,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          packageName,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: colorScheme.onSurface,
                          ),
                        ),
                        Text(
                          '${stats['bookings']} bookings',
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
                        '\$${stats['revenue'].toStringAsFixed(0)}',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: colorScheme.primary,
                        ),
                      ),
                      Text(
                        '${stats['conversion']}% conversion',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _calculateInsights(List<Booking> bookings) {
    final totalBookings = bookings.length;
    final completedBookings = bookings.where((b) => b.isCompleted).length;
    final conversionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100) : 0.0;
    
    final avgBookingValue = totalBookings > 0 
        ? bookings.fold(0.0, (sum, b) => sum + b.totalAmount) / totalBookings
        : 0.0;

    final monthlyGrowth = 12.5; // Sample data
    final clientRetention = 85.2; // Sample data

    return [
      {
        'title': 'Conversion Rate',
        'description': 'Bookings completed vs total',
        'value': '${conversionRate.toStringAsFixed(1)}%',
        'icon': Icons.trending_up,
        'color': Colors.green,
      },
      {
        'title': 'Average Booking Value',
        'description': 'Revenue per booking',
        'value': '\$${avgBookingValue.toStringAsFixed(0)}',
        'icon': Icons.attach_money,
        'color': Colors.blue,
      },
      {
        'title': 'Monthly Growth',
        'description': 'Revenue growth this month',
        'value': '+${monthlyGrowth.toStringAsFixed(1)}%',
        'icon': Icons.trending_up,
        'color': Colors.green,
      },
      {
        'title': 'Client Retention',
        'description': 'Returning clients rate',
        'value': '${clientRetention.toStringAsFixed(1)}%',
        'icon': Icons.people,
        'color': Colors.purple,
      },
    ];
  }

  Map<String, Map<String, dynamic>> _calculatePackageStats(List<Booking> bookings) {
    final packageStats = <String, Map<String, dynamic>>{};

    for (final booking in bookings) {
      final packageName = booking.packageName;
      
      if (!packageStats.containsKey(packageName)) {
        packageStats[packageName] = {
          'bookings': 0,
          'revenue': 0.0,
          'conversion': 0.0,
        };
      }

      packageStats[packageName]!['bookings'] = 
          (packageStats[packageName]!['bookings'] as int) + 1;
      packageStats[packageName]!['revenue'] = 
          (packageStats[packageName]!['revenue'] as double) + booking.totalAmount;
    }

    // Calculate conversion rates (simplified)
    for (final entry in packageStats.entries) {
      final bookings = entry.value['bookings'] as int;
      final completed = bookings * 0.85; // Sample conversion rate
      entry.value['conversion'] = (completed / bookings * 100).round();
    }

    return packageStats;
  }

  String _getMonthAbbreviation(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  }

  Color _getPaymentStatusColor(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.paid:
        return Colors.green;
      case PaymentStatus.pending:
        return Colors.orange;
      case PaymentStatus.partiallyPaid:
        return Colors.blue;
      case PaymentStatus.failed:
        return Colors.red;
      case PaymentStatus.refunded:
        return Colors.grey;
    }
  }
} 