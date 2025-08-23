import { StyleSheet } from 'react-native';
import { Colors } from '@/assets/colors/colors';

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },

  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: {
    color: Colors.white,
    fontSize: 25,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  headerGradientColors: Colors.gradientLight,

  formContainer: {
    padding: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLightPrimary,
    marginBottom: 8,
  },

  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
  },

  priorityHigh: {
    borderColor: Colors.accent,
  },

  priorityMedium: {
    borderColor: Colors.secondary,
  },

  priorityLow: {
    borderColor: Colors.primary,
  },

  priorityButtonSelectedRed: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },

  priorityButtonSelectedOrange: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },

  priorityButtonSelectedGreen: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  priorityButtonText: {
    fontWeight: 'bold',
    color: Colors.black,
  },

  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  dateTimeButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: Colors.textLightPrimary,
  },

  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  iconSelectorText: {
    fontSize: 16,
    marginLeft: 10,
    color: Colors.textLightPrimary,
  },

  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 25,
    backgroundColor: Colors.greyLight,
  },

  iconButtonSelected: {
    backgroundColor: Colors.primary,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  reminderInfo: {
    fontSize: 14,
    color: Colors.textLightPrimary,
    fontStyle: 'italic',
  },

  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const darkStyles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },

  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: {
    color: Colors.textDarkPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },

  headerGradientColors: Colors.gradientDark,

  formContainer: {
    padding: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDarkPrimary,
    marginBottom: 8,
  },

  input: {
    backgroundColor: Colors.greyDark,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    color: Colors.textDarkPrimary,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
  },

  priorityHigh: {
    borderColor: Colors.accent,
  },

  priorityMedium: {
    borderColor: Colors.secondary,
  },

  priorityLow: {
    borderColor: Colors.primaryDark,
  },

  priorityButtonSelectedRed: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },

  priorityButtonSelectedOrange: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },

  priorityButtonSelectedGreen: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },

  priorityButtonText: {
    fontWeight: 'bold',
    color: Colors.white,
  },

  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greyDark,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },

  dateTimeButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: Colors.textDarkPrimary,
    flex: 1,
  },

  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greyDark,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },

  iconSelectorText: {
    fontSize: 16,
    marginLeft: 10,
    color: Colors.textDarkPrimary,
  },

  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    backgroundColor: Colors.greyDark,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },

  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 25,
    backgroundColor: Colors.greyDark,
  },

  iconButtonSelected: {
    backgroundColor: Colors.primaryDark,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  reminderInfo: {
    fontSize: 14,
    color: Colors.textDarkSecondary,
    fontStyle: 'italic',
  },

  addButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { styles, darkStyles };
