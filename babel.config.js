module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@types': './src/types',
          '@navigation': './src/navigation',
          '@assets': './src/assets',
          '@store': './src/store',
        },
      },
    ],
    // Reanimated plugin must be listed LAST
    'react-native-reanimated/plugin',
  ],
};
