import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/assets/colors/colors';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
  },

  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerGradientColors: Colors.gradientLight,

  profileImageContainer: {
    marginBottom: 15,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.white,
  },

  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },

  profileImagePlaceholderText: {
    fontSize: 40,
    color: Colors.white,
    fontWeight: 'bold',
  },

  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  profileInfo: {
    alignItems: 'center',
  },

  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },

  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },

  editProfileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },

  editProfileButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  editNameContainer: {
    alignItems: 'center',
    width: '80%',
  },

  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    width: '100%',
    marginBottom: 10,
  },

  nameInputPlaceholder: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },

  saveButton: {
    backgroundColor: Colors.secondary,
  },

  cancelButton: {
    backgroundColor: Colors.accent,
  },

  editButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },

  section: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLightPrimary,
    marginBottom: 15,
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    marginRight: 15,
    paddingRight: 10,
    color: Colors.primary,
  },

  menuText: {
    fontSize: 16,
    paddingLeft: 10,
    color: Colors.textLightPrimary,
  },

  menuValueText: {
    fontSize: 16,
    color: Colors.textLightSecondary,
  },

  chevronIcon: {
    color: Colors.textLightSecondary,
  },

  signOutButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },

  signOutButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.textLightPrimary,
  },

  modalInput: {
    width: '100%',
    backgroundColor: Colors.greyLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    color: Colors.textLightPrimary,
  },

  modalInputPlaceholder: {
    color: Colors.textLightSecondary,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },

  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },

  modalCancelButton: {
    backgroundColor: Colors.greyMedium,
  },

  modalSaveButton: {
    backgroundColor: Colors.primary,
  },

  modalButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

  switchTrackFalse: {
    color: Colors.greyMedium,
  },

  switchTrackTrue: {
    color: Colors.primary,
  },

  switchThumbFalse: {
    color: '#f4f3f4',
  },

  switchThumbTrue: {
    color: Colors.white,
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
  },

  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerGradientColors: Colors.gradientDark,

  profileImageContainer: {
    marginBottom: 15,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#333',
  },

  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333',
  },

  profileImagePlaceholderText: {
    fontSize: 40,
    color: '#eee',
    fontWeight: 'bold',
  },

  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.bgDark,
  },

  profileInfo: {
    alignItems: 'center',
  },

  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDarkPrimary,
    marginBottom: 5,
  },

  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
  },

  editProfileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },

  editProfileButtonText: {
    color: Colors.textDarkPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },

  editNameContainer: {
    alignItems: 'center',
    width: '80%',
  },

  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDarkPrimary,
    textAlign: 'center',
    width: '100%',
    marginBottom: 10,
  },

  nameInputPlaceholder: {
    color: 'rgba(255, 255, 255, 0.5)',
  },

  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },

  saveButton: {
    backgroundColor: Colors.secondary,
  },

  cancelButton: {
    backgroundColor: Colors.accent,
  },

  editButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },

  section: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDarkPrimary,
    marginBottom: 15,
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    marginRight: 15,
    paddingRight: 10,
    color: Colors.primaryDark,
  },

  menuText: {
    fontSize: 16,
    paddingLeft: 10,
    color: Colors.textDarkPrimary,
  },

  menuValueText: {
    fontSize: 16,
    color: Colors.textDarkSecondary,
  },

  chevronIcon: {
    color: '#666',
  },

  signOutButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },

  signOutButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  modalContent: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.textDarkPrimary,
  },

  modalInput: {
    width: '100%',
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    color: Colors.textDarkPrimary,
  },

  modalInputPlaceholder: {
    color: Colors.textDarkSecondary,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },

  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },

  modalCancelButton: {
    backgroundColor: '#444',
  },

  modalSaveButton: {
    backgroundColor: Colors.primaryDark,
  },

  modalButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

  switchTrackFalse: {
    color: '#767577',
  },

  switchTrackTrue: {
    color: Colors.primaryDark,
  },

  switchThumbFalse: {
    color: '#f4f3f4',
  },

  switchThumbTrue: {
    color: Colors.white,
  },
});


export {styles, darkStyles}