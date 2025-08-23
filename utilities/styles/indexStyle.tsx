import { StyleSheet } from 'react-native';
import { Colors } from '@/assets/colors/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textLightPrimary,
  },
  appTagline: {
    fontSize: 16,
    color: Colors.textLightSecondary,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLightPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greyLight,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: Colors.primary,
    fontSize: 14,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textLightSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});

export { styles }