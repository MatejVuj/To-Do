import { StyleSheet } from 'react-native';
import { Colors } from '@/assets/colors/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },

  header: {
    paddingTop: 40,
    paddingBottom: 16,
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: Colors.textLightPrimary,
  },

  emptySubText: {
    fontSize: 14,
    color: Colors.textLightSecondary,
    marginTop: 8,
  },

  sectionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  section: {
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLightPrimary,
  },

  taskList: {
    paddingVertical: 8,
  },

  taskItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },

  editContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  checkbox: {
    marginRight: 12,
    marginLeft: 8,
  },

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLightPrimary,
    marginBottom: 4,
  },

  taskDescription: {
    fontSize: 14,
    color: Colors.textLightSecondary,
    marginBottom: 8,
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.textLightSecondary,
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },

  metaText: {
    fontSize: 12,
    color: Colors.textLightSecondary,
    marginLeft: 4,
  },

  deleteButton: {
    padding: 8,
  },

  inputGroup: {
    marginBottom: 16,
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

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  saveButton: {
    backgroundColor: Colors.primary,
  },

  cancelButton: {
    backgroundColor: Colors.greyMedium,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
    flex: 1,
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textLightPrimary,
    paddingVertical: 0,
  },

  unfinishedText: {
    color: Colors.accent,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },

  header: {
    paddingTop: 40,
    paddingBottom: 16,
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: Colors.textDarkPrimary,
  },

  emptySubText: {
    fontSize: 14,
    color: Colors.textDarkSecondary,
    marginTop: 8,
  },

  sectionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  section: {
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDarkPrimary,
  },

  taskList: {
    paddingVertical: 8,
  },

  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },

  editContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  checkbox: {
    marginRight: 12,
    marginLeft: 8,
  },

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDarkPrimary,
    marginBottom: 4,
  },

  taskDescription: {
    fontSize: 14,
    color: Colors.textDarkSecondary,
    marginBottom: 8,
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },

  metaText: {
    fontSize: 12,
    color: Colors.textDarkSecondary,
    marginLeft: 4,
  },

  deleteButton: {
    padding: 8,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDarkPrimary,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#1E1E1E',
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

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  saveButton: {
    backgroundColor: Colors.primaryDark,
  },

  cancelButton: {
    backgroundColor: '#444',
  },

  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
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
    backgroundColor: '#1E1E1E',
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
    backgroundColor: '#1E1E1E',
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
    backgroundColor: '#333',
  },

  iconButtonSelected: {
    backgroundColor: Colors.primaryDark,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textDarkPrimary,
    paddingVertical: 0,
  },

  unfinishedText: {
    color: Colors.accent,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});


export { styles, darkStyles }