import { useClerk, useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WorkspaceMenuSection } from "@/components/WorkspaceMenuSection";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { theme } from "@/lib/config";
import { getUserDisplayName, getUserInitials } from "@/lib/user-profile";

const AVATAR_SIZE = 34;

export function ProfileMenu() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { activeWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);

  const displayName = user ? getUserDisplayName(user) : "Account";
  const email = user?.primaryEmailAddress?.emailAddress;
  const initials = getUserInitials(displayName);
  const imageUrl = user?.imageUrl;

  const handleSignOut = () => {
    setOpen(false);
    void (async () => {
      queryClient.clear();
      await signOut();
      router.replace("/(auth)/sign-in");
    })();
  };

  const closeMenu = () => setOpen(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel="Account menu"
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <View style={[styles.menuAnchor, { top: insets.top + 52 }]}>
            <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
              <View style={styles.profileSection}>
                <Text style={styles.displayName} numberOfLines={2}>
                  {displayName}
                </Text>
                {email ? (
                  <Text style={styles.email} numberOfLines={1}>
                    {email}
                  </Text>
                ) : null}
                {activeWorkspace ? (
                  <Text style={styles.workspaceHint} numberOfLines={1}>
                    {activeWorkspace.name}
                  </Text>
                ) : null}
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>Workspaces</Text>
              <WorkspaceMenuSection onSelect={closeMenu} />

              <View style={styles.divider} />

              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [styles.logoutRow, pressed && styles.logoutRowPressed]}
                accessibilityRole="button"
                accessibilityLabel="Log out"
              >
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary,
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  menuAnchor: {
    position: "absolute",
    right: 20,
    alignItems: "flex-end",
  },
  menu: {
    minWidth: 260,
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  profileSection: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  displayName: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600",
  },
  email: {
    color: theme.textMuted,
    fontSize: 11,
  },
  workspaceHint: {
    color: theme.primary,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
  },
  sectionLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 4,
  },
  logoutRow: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 9,
  },
  logoutRowPressed: {
    backgroundColor: theme.surfaceAlt,
  },
  logoutText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "500",
  },
});
