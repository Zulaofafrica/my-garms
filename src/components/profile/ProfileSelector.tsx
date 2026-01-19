"use client";

import { Profile } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, User, Trash2, Check } from "lucide-react";
import styles from "./ProfileSelector.module.css";

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfileId: string | null;
  onSelectProfile: (profileId: string) => void;
  onAddProfile: () => void;
  onDeleteProfile: (profileId: string) => void;
}

export function ProfileSelector({
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
}: ProfileSelectorProps) {
  return (
    <div className={styles.profileSelector}>
      <div className={styles.header}>
        <h3>Profiles</h3>
        <span className={styles.profileCount}>{profiles.length} saved</span>
      </div>

      <div className={styles.profilesList}>
        <AnimatePresence mode="popLayout">
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${styles.profileCard} ${activeProfileId === profile.id ? styles.active : ''}`}
              onClick={() => onSelectProfile(profile.id)}
            >
              <div className={styles.profileAvatar}>
                <User size={20} />
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{profile.name}</span>
                <span className={styles.profileGender}>{profile.gender}</span>
              </div>
              {activeProfileId === profile.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={styles.activeIndicator}
                >
                  <Check size={14} />
                </motion.div>
              )}
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete "${profile.name}"?`)) {
                    onDeleteProfile(profile.id);
                  }
                }}
                title="Delete profile"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        className={styles.addProfileBtn}
        onClick={onAddProfile}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus size={18} />
        <span>Add Profile</span>
      </motion.button>
    </div>
  );
}
