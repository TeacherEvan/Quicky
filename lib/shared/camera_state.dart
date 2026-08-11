import 'package:flutter/foundation.dart';

/// Shared camera-capture state used by cost + location tiles.
@immutable
class CameraCaptureState {
  const CameraCaptureState({
    this.imagePath,
    this.thaiPhrase = '',
    this.placeName = '',
    this.hasError = false,
    this.errorMessage,
  });

  final String? imagePath;
  final String thaiPhrase;
  final String placeName;
  final bool hasError;
  final String? errorMessage;

  CameraCaptureState copyWith({
    String? imagePath,
    String? thaiPhrase,
    String? placeName,
    bool? hasError,
    String? errorMessage,
  }) {
    return CameraCaptureState(
      imagePath: imagePath ?? this.imagePath,
      thaiPhrase: thaiPhrase ?? this.thaiPhrase,
      placeName: placeName ?? this.placeName,
      hasError: hasError ?? this.hasError,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CameraCaptureState &&
          runtimeType == other.runtimeType &&
          imagePath == other.imagePath &&
          thaiPhrase == other.thaiPhrase &&
          placeName == other.placeName &&
          hasError == other.hasError &&
          errorMessage == other.errorMessage;

  @override
  int get hashCode =>
      imagePath.hashCode ^
      thaiPhrase.hashCode ^
      placeName.hashCode ^
      hasError.hashCode ^
      errorMessage.hashCode;
}
