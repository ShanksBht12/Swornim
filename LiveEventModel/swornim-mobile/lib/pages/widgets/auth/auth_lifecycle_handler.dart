import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:swornim/pages/providers/auth/auth_provider.dart';

class AuthLifecycleHandler extends ConsumerStatefulWidget {
  final Widget child;

  const AuthLifecycleHandler({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  ConsumerState<AuthLifecycleHandler> createState() => _AuthLifecycleHandlerState();
}

class _AuthLifecycleHandlerState extends ConsumerState<AuthLifecycleHandler> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    ref.read(authProvider.notifier).handleAppLifecycleChange(state);
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
} 