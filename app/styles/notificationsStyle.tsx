import { StyleSheet } from 'react-native';
import { Colors } from '@/assets/colors/colors';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  headerTitle: { color: Colors.white, fontSize: 24, fontWeight: 'bold' },
  headerGradientColors: Colors.gradientLight,
  refreshButton: { padding: 5 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.textLightSecondary },

  scrollViewContent: { flex: 1, padding: 20 },

  section: {
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textLightPrimary, marginBottom: 10 },
  infoText: { fontSize: 14, color: Colors.textLightSecondary, marginBottom: 15 },
  debugText: { fontSize: 12, color: Colors.textLightSecondary, marginBottom: 10 },

  /* ---------- controls ---------- */
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  /* ---------- task item ---------- */
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greyLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  priorityIndicator: { width: 8, height: '100%', borderRadius: 4, marginRight: 10 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textLightPrimary },
  taskDateTime: { fontSize: 13, color: Colors.textLightSecondary, marginTop: 2 },
  notificationStatusScheduled: { fontSize: 13, color: Colors.success, marginTop: 2, fontWeight: 'bold' },
  notificationStatusNotScheduled: { fontSize: 13, color: Colors.overdue, marginTop: 2, fontWeight: 'bold' },
  taskActions: { flexDirection: 'row', marginLeft: 10 },
  actionButton: { padding: 5, marginLeft: 5 },
  noTasksText: { fontSize: 16, color: Colors.textLightSecondary, textAlign: 'center', marginTop: 20 },
});

/* ---------- dark ---------- */
const darkStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: Colors.textDarkPrimary, fontSize: 24, fontWeight: 'bold' },
  headerGradientColors: Colors.gradientDark,
  refreshButton: { padding: 5 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.textDarkSecondary },

  scrollViewContent: { flex: 1, padding: 20 },

  section: {
    backgroundColor: '#1f2630',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textDarkPrimary, marginBottom: 10 },
  infoText: { fontSize: 14, color: Colors.textDarkSecondary, marginBottom: 15 },
  debugText: { fontSize: 12, color: Colors.textDarkSecondary, marginBottom: 10 },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  priorityIndicator: { width: 8, height: '100%', borderRadius: 4, marginRight: 10 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textDarkPrimary },
  taskDateTime: { fontSize: 13, color: Colors.textDarkSecondary, marginTop: 2 },
  notificationStatusScheduled: { fontSize: 13, color: Colors.primaryDark, marginTop: 2, fontWeight: 'bold' },
  notificationStatusNotScheduled: { fontSize: 13, color: Colors.accent, marginTop: 2, fontWeight: 'bold' },
  taskActions: { flexDirection: 'row', marginLeft: 10 },
  actionButton: { padding: 5, marginLeft: 5 },
  noTasksText: { fontSize: 16, color: Colors.textDarkSecondary, textAlign: 'center', marginTop: 20 },
});

export { styles, darkStyles };