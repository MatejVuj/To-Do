import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/assets/colors/colors.ts';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeAreaViewContainer: { 
    flex: 1 , 
    backgroundColor: Colors.bgLight
  
  },

  container: { 
    flex: 1, 
    backgroundColor: Colors.bgLight, 
    paddingTop: 50 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.bgLight 
  },
  loadingIndicator: { 
    color: Colors.primary 
  },

  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    
  },

  headerGradientColors:  Colors.gradientLight,

  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  greeting: { 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.8)', 
    marginBottom: 4, 
    paddingLeft: 10 
  },
  userName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.white, 
    paddingLeft: 10 
  },
  addButton: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  addButtonIcon: { color: Colors.white },

  statsContainer: { 
    paddingHorizontal: 20, 
    marginTop: -30 
  },
  statsCard: { 
    backgroundColor: Colors.white, 
    borderRadius: 16, 
    padding: 20, 
    shadowColor: Colors.secondary, 
    shadowOpacity: 0.15 
  },
  statsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
     alignItems: 'center',
      marginBottom: 12 
    },
  statsTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.textLightPrimary 
  },
  statsPercentage: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.primary 
  },
  progressBarContainer: { 
    height: 8, 
    backgroundColor: Colors.greyLight, 
    borderRadius: 4, 
    marginBottom: 20, 
    overflow: 'hidden' 
  },
  progressBar: { 
    height: '100%', 
    backgroundColor: Colors.primary, 
    borderRadius: 4 
  },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  statItem: { 
    alignItems: 'center' 
  },
  statValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: Colors.textLightPrimary
   },
  overdueValue: { color: Colors.overdue },
  statLabel: { 
    fontSize: 12, 
    color: Colors.textLightSecondary, 
    marginTop: 4 
  },
  sectionContainer: { 
    padding: 20 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.textLightPrimary
   },
  seeAllText: { 
    fontSize: 14, 
    color: Colors.primary, 
    fontWeight: '500' 
  },

  recentTasksContainer: { 
    backgroundColor: Colors.white, 
    borderRadius: 16, 
    padding: 16 
  },
  taskItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.borderLight 
  },
  priorityIndicator: { 
    width: 4, 
    height: '80%', 
    borderRadius: 2, 
    marginRight: 12 
  },
  taskContent: { 
    flex: 1 
  },
  taskTitle: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: Colors.textLightPrimary, 
    marginBottom: 4 
  },
  completedTaskTitle: { 
    textDecorationLine: 'line-through', 
    color: Colors.textLightSecondary 
  },
  taskMeta: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 12 
  },
  metaText: { 
    fontSize: 12, 
    color: Colors.textLightSecondary, 
    marginLeft: 4 
  },
  metaIcon: { 
    color: Colors.textLightSecondary 
  },
  taskIcon: { 
    color: Colors.primary 
  },
  completedCheckIcon: { 
    color: Colors.textLightSecondary
   },
  pendingCheckIcon: { 
    color: Colors.primary 
  },

  emptyTasksContainer: { 
    alignItems: 'center', 
    padding: 20 
  },
  emptyTasksIcon: { 
    color: Colors.textLightSecondary 
  },
  emptyTasksText: { 
    fontSize: 16, 
    color: Colors.textLightSecondary, 
    marginTop: 8, 
    marginBottom: 16 
  },
  createTaskButton: { 
    backgroundColor: Colors.primary, 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
  createTaskButtonText: { 
    color: Colors.white, 
    fontWeight: '500' 
  },

  quickActionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 16, flexWrap: 'wrap'
   },
  quickActionButton: { 
    alignItems: 'center',
     width: (width - 80) / 3, 
     marginBottom: 15 
    },
  quickActionIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  quickActionText: { 
    fontSize: 12, 
    color: Colors.textLightPrimary 
  },
  quickActionNewTaskBg: { 
    color: `${Colors.primary}20` 
  },
  quickActionNewTaskIcon: { 
    color: Colors.primary 
  },
  quickActionAllTasksBg: { 
    color: `${Colors.secondary}20` 
  },
  quickActionAllTasksIcon: { 
    color: Colors.secondary 
  },
  quickActionNotificationsBg: { 
    color: `${Colors.secondary}20` 
  },
  quickActionNotificationsIcon: { 
    color: Colors.secondary 
  },
  quickActionProfileBg: { 
    color: `${Colors.accent}20` 
  },
  quickActionProfileIcon: { 
    color: Colors.accent 
  },

  tipContainer: { 
    marginHorizontal: 20,
     marginBottom: 30,
      backgroundColor: Colors.white,
       borderRadius: 16,
        padding: 16 
      },
  tipContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  tipIcon: { 
    marginRight: 12, 
    color: Colors.primary 
  },
  tipTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: Colors.textLightPrimary, 
    marginBottom: 4 
  },
  tipText: { 
    fontSize: 14, 
    color: Colors.textLightSecondary, 
    flexShrink: 1 
  },

  priorityHigh: { 
    color: Colors.accent 
  },
  priorityMedium: { 
    color: Colors.secondary 
  },
  priorityLow: { 
    color: Colors.primary 
  },
});

const darkStyles = StyleSheet.create({
  safeAreaViewContainer: { 
    flex: 1, 
    backgroundColor: Colors.bgDark 
  },
  container: { 
    flex: 1, 
    backgroundColor: Colors.bgDark, 
    paddingTop: 50 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.bgDark },
  loadingIndicator: { 
    color: Colors.primaryDark 
  },

  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerGradientColors: Colors.gradientDark,

  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  greeting: { 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.6)', 
    marginBottom: 4, 
    paddingLeft: 10 
  },
  userName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.textDarkPrimary, 
    paddingLeft: 10 
  },
  addButton: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  addButtonIcon: { 
    color: Colors.white 
  },

  statsContainer: { 
    paddingHorizontal: 20,
     marginTop: -30 
    },
  statsCard: { 
    backgroundColor: '#1f2630', 
    borderRadius: 16, 
    padding: 20, 
    shadowColor: Colors.secondary, 
    shadowOpacity: 0.3 
  },
  statsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  statsTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.textDarkPrimary 
  },
  statsPercentage: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.primaryDark 
  },
  progressBarContainer: { 
    height: 8, 
    backgroundColor: '#2c2c2c',
     borderRadius: 4,
      marginBottom: 20, 
      overflow: 'hidden' 
    },
  progressBar: { 
    height: '100%',
     backgroundColor: Colors.primaryDark, 
     borderRadius: 4 
    },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between'
   },
  statItem: { 
    alignItems: 'center' 
  },
  statValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#eee' 
  },
  overdueValue: { 
    color: Colors.accent 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#aaa', 
    marginTop: 4 
  },

  sectionContainer: { 
    padding: 20 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.textDarkPrimary 
  },
  seeAllText: { 
    fontSize: 14, 
    color: Colors.primaryDark, 
    fontWeight: '500' 
  },

  recentTasksContainer: { 
    backgroundColor: '#1f2630', 
    borderRadius: 16, 
    padding: 16 
  },
  taskItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#2c2c2c' 
  },
  priorityIndicator: { 
    width: 4, 
    height: '80%', 
    borderRadius: 2, 
    marginRight: 12 
  },
  taskContent: { 
    flex: 1 
  },
  taskTitle: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: Colors.textDarkPrimary, 
    marginBottom: 4 
  },
  completedTaskTitle: { 
    textDecorationLine: 'line-through', 
    color: '#aaa'
   },
  taskMeta: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 12 
  },
  metaText: { 
    fontSize: 12, 
    color: '#bbb', 
    marginLeft: 4 
  },
  metaIcon: { 
    color: Colors.primaryDark 
  },
  taskIcon: { 
    color: Colors.primaryDark 
  },
  completedCheckIcon: { 
    color: '#aaa' 
  },
  pendingCheckIcon: { 
    color: Colors.primaryDark 
  },

  emptyTasksContainer: { 
    alignItems: 'center', 
    padding: 20 
  },
  emptyTasksIcon: { 
    color: '#444' 
  },
  emptyTasksText: { 
    fontSize: 16, 
    color: '#aaa', 
    marginTop: 8, 
    marginBottom: 16 
  },
  createTaskButton: { 
    backgroundColor: Colors.primaryDark, 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
  createTaskButtonText: { 
    color: Colors.white, 
    fontWeight: '500' 
  },

  quickActionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 16, flexWrap: 'wrap' 
  },
  quickActionButton: { 
    alignItems: 'center', 
    width: (width - 80) / 3, 
    marginBottom: 15 
  },
  quickActionIcon: { 
    width: 48,
     height: 48, 
     borderRadius: 24, 
     justifyContent: 'center', 
     alignItems: 'center',
      marginBottom: 8 
    },
  quickActionText: { 
    fontSize: 12, 
    color: Colors.textDarkPrimary
   },
  quickActionNewTaskBg: { 
    color: `${Colors.primaryDark}20` 
  },
  quickActionNewTaskIcon: { 
    color: Colors.primaryDark 
  },
  quickActionAllTasksBg: { 
    color: `${Colors.secondary}20`
   },
  quickActionAllTasksIcon: { 
    color: Colors.secondary 
  },
  quickActionNotificationsBg: { 
    color: `${Colors.secondary}20` 
  },
  quickActionNotificationsIcon: { 
    color: Colors.secondary 
  },
  quickActionProfileBg: { 
    color: `${Colors.accent}20` 
  },
  quickActionProfileIcon: { 
    color: Colors.accent 
  },

  tipContainer: { 
    marginHorizontal: 20,
     marginBottom: 30, 
     backgroundColor: '#1f2630', 
     borderRadius: 16, 
     padding: 16 
    },
  tipContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  tipIcon: { 
    marginRight: 12, 
    color: Colors.primaryDark 
  },
  tipTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: Colors.textDarkPrimary, 
    marginBottom: 4 
  },
  tipText: { 
    fontSize: 14, 
    color: '#bbb', 
    flexShrink: 1 
  },

  priorityHigh: { 
    color: Colors.accent
   },
  priorityMedium: { 
    color: Colors.secondary
   },
  priorityLow: { 
    color: Colors.primaryDark 
  },
});

export { styles, darkStyles };