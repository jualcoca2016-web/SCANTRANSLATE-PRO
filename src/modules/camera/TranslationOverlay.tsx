import React from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import type { TranslationResult } from "../../types/translation";
import { IMAGE_REF_WIDTH, IMAGE_REF_HEIGHT } from "./ocr.mock";

interface Props {
  result: TranslationResult;
}

/**
 * Renderiza bloques de traducción superpuestos sobre la imagen capturada.
 * Las coordenadas del boundingBox (en pixels de imagen de referencia)
 * se escalan al tamaño real del contenedor en pantalla.
 */
export default function TranslationOverlay({ result }: Props) {
  const [containerSize, setContainerSize] = React.useState({
    width: IMAGE_REF_WIDTH,
    height: IMAGE_REF_HEIGHT,
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const scaleX = containerSize.width / IMAGE_REF_WIDTH;
  const scaleY = containerSize.height / IMAGE_REF_HEIGHT;

  return (
    <View style={StyleSheet.absoluteFill} onLayout={handleLayout} pointerEvents="none">
      {result.blocks.map((block, index) => {
        const { x, y, width, height } = block.boundingBox;
        return (
          <View
            key={index}
            style={[
              styles.block,
              {
                left: x * scaleX,
                top: y * scaleY,
                minWidth: width * scaleX,
                minHeight: height * scaleY,
              },
            ]}
          >
            <Text style={styles.translatedText} numberOfLines={3}>
              {block.translatedText}
            </Text>
          </View>
        );
      })}

      {/* Barra inferior con el texto completo traducido */}
      <View style={styles.fullTextBar}>
        <Text style={styles.languageTag}>
          {result.sourceLanguage.toUpperCase()} → {result.targetLanguage.toUpperCase()}
        </Text>
        <Text style={styles.fullText} numberOfLines={2}>
          {result.fullTranslatedText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderLeftWidth: 3,
    borderLeftColor: "#4ADE80", // verde — indica traducción activa
  },
  translatedText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  fullTextBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  languageTag: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
    letterSpacing: 1,
  },
  fullText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
});
