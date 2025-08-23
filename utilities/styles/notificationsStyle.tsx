import { StyleSheet } from 'react-native';
import { Colors } from '@/assets/colors/colors';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerGradientColors: Colors.gradientLight,
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLightPrimary,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 16,
    color: Colors.textLightPrimary,
    marginLeft: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: Colors.textLightSecondary,
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  testButton: {
    backgroundColor: Colors.secondary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const darkStyles = StyleSheet.create({
  safeArea: {
    ...styles.safeArea,
    backgroundColor: Colors.bgDark,
  },
  container: {
    ...styles.container,
  },
  header: {
    ...styles.header,
  },
  headerTitle: {
    ...styles.headerTitle,
    color: Colors.textDarkPrimary,
  },
  headerGradientColors: Colors.gradientDark,
  contentContainer: {
    ...styles.contentContainer,
  },
  section: {
    ...styles.section,
    backgroundColor: '#1f2630',
  },
  sectionTitle: {
    ...styles.sectionTitle,
    color: Colors.textDarkPrimary,
  },
  settingRow: {
    ...styles.settingRow,
  },
  settingText: {
    ...styles.settingText,
    color: Colors.textDarkPrimary,
  },
  settingLeft: {
    ...styles.settingLeft,
  },
  optionRow: {
    ...styles.optionRow,
  },
  optionText: {
    ...styles.optionText,
    color: Colors.textDarkSecondary,
  },
  selectedOptionText: {
    ...styles.selectedOptionText,
    color: Colors.primaryDark,
  },
  button: {
    ...styles.button,
  },
  saveButton: {
    ...styles.saveButton,
    backgroundColor: Colors.primaryDark,
  },
  testButton: {
    ...styles.testButton,
    backgroundColor: Colors.secondaryDark,
  },
  buttonText: {
    ...styles.buttonText,
  },
});

export { styles, darkStyles }
