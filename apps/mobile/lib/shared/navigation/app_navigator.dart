import 'package:flutter/widgets.dart';

/// Global navigator key so out-of-tree callers (the share listener) can push
/// routes without a BuildContext.
final GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();
