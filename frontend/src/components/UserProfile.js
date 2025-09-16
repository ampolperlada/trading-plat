import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Award, 
  TrendingUp, 
  BookOpen, 
  HelpCircle,
  Heart,
  Users,
  BarChart3,
  FileText,
  Copy,
  Edit3,
  ChevronRight
} from 'lucide-react';

const UserProfile = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'Social Trader',
      description: 'Complete your first social trade',
      progress: 0,
      total: 1,
      icon: Users,
      unlocked: false
    },
    {
      id: 2,
      title: 'Profit Master',
      description: 'Achieve 10 consecutive profitable trades',
      progress: 3,
      total: 10,
      icon: TrendingUp,
      unlocked: false
    },
    {
      id: 3,
      title: 'Education Enthusiast',
      description: 'Complete 5 educational modules',
      progress: 1,
      total: 5,
      icon: BookOpen,
      unlocked: false
    }
  ]);

  const menuItems = [
    { id: 'trade', icon: BarChart3, label: 'Trade', active: false },
    { id: 'finances', icon: TrendingUp, label: 'Finances', active: false },
    { id: 'profile', icon: User, label: 'Profile', active: true },
    { id: 'apps', icon: Settings, label: 'Apps', active: false },
    { id: 'education', icon: BookOpen, label: 'Education', active: false },
    { id: 'help', icon: HelpCircle, label: 'Help', active: false },
    { id: 'battles', icon: Award, label: 'Battles', active: false },
    { id: 'invite', icon: Heart, label: 'Invite and Earn', active: false }
  ];

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Demo',
    lastName: user?.lastName || 'User',
    email: user?.email || 'demo@trading.com',
    profileId: '547-785-194',
    country: 'PH',
    accountType: 'DEMO',
    joinDate: '2024-09-15',
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <div className="w-20 bg-slate-800 flex flex-col items-center py-6 space-y-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors relative ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
            {item.active && (
              <div className="absolute -right-1 top-1 w-2 h-2 bg-blue-400 rounded-full"></div>
            )}
          </button>
        ))}
        
        <button 
          onClick={onBack}
          className="mt-auto w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
          <Bell className="w-5 h-5 text-gray-400" />
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Edit3 className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold">Hello,</h2>
                <button className="text-blue-400 hover:text-blue-300">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {profileData.firstName} {profileData.lastName}
              </h3>
              <div className="flex items-center space-x-3">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {profileData.accountType}
                </span>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-400">{achievements.filter(a => a.unlocked).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Achievements */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upcoming achievements</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm">More</button>
            </div>
            
            <div className="space-y-3">
              {achievements.filter(a => !a.unlocked).slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="bg-slate-800 rounded-lg p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                    <achievement.icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{achievement.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {achievement.progress} / {achievement.total}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
            
            {/* Achievement Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account information</h3>
            
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-gray-400 text-sm">Profile ID</div>
                    <div className="font-semibold">{profileData.profileId}</div>
                  </div>
                </div>
                <button 
                  onClick={() => copyToClipboard(profileData.profileId)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-gray-400">@</div>
                  <div>
                    <div className="text-gray-400 text-sm">Email</div>
                    <div className="font-semibold">{profileData.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => copyToClipboard(profileData.email)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-gray-400 text-center">🌍</div>
                  <div>
                    <div className="text-gray-400 text-sm">Country</div>
                    <div className="font-semibold">{profileData.country}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Trading Statistics */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Trading Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{profileData.totalTrades}</div>
                <div className="text-gray-400 text-sm">Total Trades</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{profileData.winRate}%</div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">${profileData.totalProfit.toFixed(2)}</div>
                <div className="text-gray-400 text-sm">Total Profit</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{profileData.joinDate}</div>
                <div className="text-gray-400 text-sm">Member Since</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-20 right-0 bg-slate-800 border-t border-slate-700">
          <div className="flex justify-around py-3">
            {[
              { icon: User, label: 'Profile', active: true },
              { icon: FileText, label: 'Trade hist.', active: false },
              { icon: BarChart3, label: 'Analytics', active: false },
              { icon: FileText, label: 'Documents', active: false },
              { icon: Shield, label: 'Security', active: false }
            ].map((item, index) => (
              <button
                key={index}
                className={`flex flex-col items-center space-y-1 px-4 py-2 ${
                  item.active ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;