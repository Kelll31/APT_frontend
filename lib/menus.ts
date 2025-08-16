export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: "",
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard/analytics",
          label: t("dashboard"),
          active: pathname.includes("/dashboard"),
          icon: "heroicons-outline:home",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("security_tools_group"),
      id: "security-tools",
      menus: [
        {
          id: "vulnerability-scanner",
          href: "/security/vulnerability-scanner",
          label: t("vulnerability_scanner"),
          active: pathname.includes("/security/vulnerability-scanner"),
          icon: "heroicons:magnifying-glass",
          submenus: [
            {
              href: "/security/vulnerability-scanner/new-scan",
              label: t("new_scan"),
              active: pathname === "/security/vulnerability-scanner/new-scan",
              icon: "heroicons:plus-circle",
              children: [],
            },
            {
              href: "/security/vulnerability-scanner/scan-history",
              label: t("scan_history"),
              active: pathname === "/security/vulnerability-scanner/scan-history",
              icon: "heroicons:clock",
              children: [],
            },
            {
              href: "/security/vulnerability-scanner/scheduled-scans",
              label: t("scheduled_scans"),
              active: pathname === "/security/vulnerability-scanner/scheduled-scans",
              icon: "heroicons:calendar",
              children: [],
            },
            {
              href: "/security/vulnerability-scanner/scan-results",
              label: t("scan_results"),
              active: pathname === "/security/vulnerability-scanner/scan-results",
              icon: "heroicons:document-chart-bar",
              children: [],
            },
          ],
        },
        {
          id: "attack-builder",
          href: "/security/attack-builder",
          label: t("attack_builder"),
          active: pathname.includes("/security/attack-builder"),
          icon: "heroicons:wrench-screwdriver",
          submenus: [
            {
              href: "/security/attack-builder/create",
              label: t("create_new_attack"),
              active: pathname === "/security/attack-builder/create",
              icon: "heroicons:plus",
              children: [],
            },
            {
              href: "/security/attack-builder/template",
              label: t("attack_templates"),
              active: pathname === "/security/attack-builder/template",
              icon: "heroicons:document-duplicate",
              children: [],
            },
            {
              href: "/security/attack-builder/active",
              label: t("active_attacks"),
              active: pathname === "/security/attack-builder/active",
              icon: "heroicons:bolt",
              children: [],
            },
            {
              href: "/security/attack-builder/history",
              label: t("attack_history"),
              active: pathname === "/security/attack-builder/history",
              icon: "heroicons:archive-box",
              children: [],
            },
          ],
        },
        {
          id: "network-discovery",
          href: "/security/network-discovery",
          label: t("network_discovery"),
          active: pathname.includes("/security/network-discovery"),
          icon: "heroicons:map",
          submenus: [
            {
              href: "/security/network-discovery/hosts",
              label: t("host_discovery"),
              active: pathname === "/security/network-discovery/hosts",
              icon: "heroicons:computer-desktop",
              children: [],
            },
            {
              href: "/security/network-discovery/topology",
              label: t("network_topology"),
              active: pathname === "/security/network-discovery/topology",
              icon: "heroicons:share",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("reports"),
      id: "reports",
      menus: [
        {
          id: "reports",
          href: "/reports/security",
          label: t("reports"),
          active: pathname.includes("/reports"),
          icon: "heroicons:document-text",
          submenus: [
            {
              href: "/reports/security",
              label: t("security_reports"),
              active: pathname === "/reports/security",
              icon: "heroicons:shield-exclamation",
              children: [
                {
                  href: "/reports/security/vulnerability",
                  label: t("vulnerability_report"),
                  active: pathname === "/reports/security/vulnerability",
                },
                {
                  href: "/reports/security/penetration-test",
                  label: t("penetration_test_report"),
                  active: pathname === "/reports/security/penetration-test",
                },
                {
                  href: "/reports/security/compliance",
                  label: t("compliance_report"),
                  active: pathname === "/reports/security/compliance",
                },
                {
                  href: "/reports/security/executive",
                  label: t("executive_summary"),
                  active: pathname === "/reports/security/executive",
                },
              ],
            },
            {
              href: "/reports/custom",
              label: t("custom_reports"),
              active: pathname === "/reports/custom",
              icon: "heroicons:pencil-square",
              children: [
                {
                  href: "/reports/custom/builder",
                  label: t("report_builder"),
                  active: pathname === "/reports/custom/builder",
                },
                {
                  href: "/reports/custom/templates",
                  label: t("custom_templates"),
                  active: pathname === "/reports/custom/templates",
                },
              ],
            },
            {
              href: "/reports/scheduled",
              label: t("scheduled_reports"),
              active: pathname === "/reports/scheduled",
              icon: "heroicons:calendar-days",
              children: [],
            },
            {
              href: "/reports/exports",
              label: t("export_center"),
              active: pathname === "/reports/exports",
              icon: "heroicons:arrow-down-tray",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("analytics"),
      id: "analytics",
      menus: [
        {
          id: "analytics",
          href: "/analytics/threat-intelligence",
          label: t("analytics"),
          active: pathname.includes("/analytics"),
          icon: "heroicons:chart-pie",
          submenus: [
            {
              href: "/analytics/threat-intelligence",
              label: t("threat_intelligence"),
              active: pathname === "/analytics/threat-intelligence",
              icon: "heroicons:eye",
              children: [],
            },
            {
              href: "/analytics/risk-analysis",
              label: t("risk_analysis"),
              active: pathname === "/analytics/risk-analysis",
              icon: "heroicons:exclamation-triangle",
              children: [],
            },
            {
              href: "/analytics/trends",
              label: t("trend_analysis"),
              active: pathname === "/analytics/trends",
              icon: "heroicons:arrow-trending-up",
              children: [],
            },
            {
              href: "/analytics/performance",
              label: t("performance_metrics"),
              active: pathname === "/analytics/performance",
              icon: "heroicons:chart-bar",
              children: [],
            },
            {
              href: "/analytics/correlations",
              label: t("event_correlation"),
              active: pathname === "/analytics/correlations",
              icon: "heroicons:link",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("configuration_group"),
      id: "configuration",
      menus: [
        {
          id: "targets",
          href: "/config/targets",
          label: t("target_management"),
          active: pathname.includes("/config/targets"),
          icon: "heroicons:globe-americas",
          submenus: [
            {
              href: "/config/targets/hosts",
              label: t("hosts_networks"),
              active: pathname === "/config/targets/hosts",
              icon: "heroicons:server",
              children: [],
            },
            {
              href: "/config/targets/web-apps",
              label: t("web_applications"),
              active: pathname === "/config/targets/web-apps",
              icon: "heroicons:globe-alt",
              children: [],
            },
            {
              href: "/config/targets/groups",
              label: t("target_groups"),
              active: pathname === "/config/targets/groups",
              icon: "heroicons:rectangle-group",
              children: [],
            },
          ],
        },
        {
          id: "credentials",
          href: "/config/credentials",
          label: t("credentials_group"),
          active: pathname.includes("/config/credentials"),
          icon: "heroicons:key",
          submenus: [
            {
              href: "/config/credentials/manage",
              label: t("manage_credentials"),
              active: pathname === "/config/credentials/manage",
              icon: "heroicons:identification",
              children: [],
            },
            {
              href: "/config/credentials/vaults",
              label: t("credential_vaults"),
              active: pathname === "/config/credentials/vaults",
              icon: "heroicons:lock-closed",
              children: [],
            },
          ],
        },
        {
          id: "policies",
          href: "/config/policies",
          label: t("scan_policies"),
          active: pathname.includes("/config/policies"),
          icon: "heroicons:document-check",
          submenus: [
            {
              href: "/config/policies/scan",
              label: t("scanning_policies"),
              active: pathname === "/config/policies/scan",
              icon: "heroicons:adjustments-horizontal",
              children: [],
            },
            {
              href: "/config/policies/compliance",
              label: t("compliance_policies"),
              active: pathname === "/config/policies/compliance",
              icon: "heroicons:clipboard-document-check",
              children: [],
            },
          ],
        },
        {
          id: "templates",
          href: "/config/templates",
          label: t("templates_group"),
          active: pathname.includes("/config/templates"),
          icon: "heroicons:squares-2x2",
          submenus: [
            {
              href: "/config/templates/scan",
              label: t("scan_templates"),
              active: pathname === "/config/templates/scan",
              icon: "heroicons:document-duplicate",
              children: [],
            },
            {
              href: "/config/templates/report",
              label: t("report_templates"),
              active: pathname === "/config/templates/report",
              icon: "heroicons:document-text",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("administration_group"),
      id: "administration",
      menus: [
        {
          id: "users",
          href: "/admin/users",
          label: t("user_management"),
          active: pathname.includes("/admin/users"),
          icon: "heroicons:users",
          submenus: [
            {
              href: "/admin/users/manage",
              label: t("manage_users"),
              active: pathname === "/admin/users/manage",
              icon: "heroicons:user-plus",
              children: [],
            },
            {
              href: "/admin/users/roles",
              label: t("roles_permissions"),
              active: pathname === "/admin/users/roles",
              icon: "heroicons:shield-check",
              children: [],
            },
            {
              href: "/admin/users/groups",
              label: t("user_groups"),
              active: pathname === "/admin/users/groups",
              icon: "heroicons:user-group",
              children: [],
            },
          ],
        },
        {
          id: "settings",
          href: "/admin/settings",
          label: t("settings"),
          active: pathname.includes("/admin/settings"),
          icon: "heroicons:cog-8-tooth",
          submenus: [
            {
              href: "/admin/settings/general",
              label: t("general_settings"),
              active: pathname === "/admin/settings/general",
              icon: "heroicons:adjustments-vertical",
              children: [],
            },
            {
              href: "/admin/settings/security",
              label: t("security_settings"),
              active: pathname === "/admin/settings/security",
              icon: "heroicons:lock-closed",
              children: [],
            },
            {
              href: "/admin/settings/notifications",
              label: t("notification_settings"),
              active: pathname === "/admin/settings/notifications",
              icon: "heroicons:bell",
              children: [],
            },
            {
              href: "/admin/settings/integrations",
              label: t("integrations"),
              active: pathname === "/admin/settings/integrations",
              icon: "heroicons:puzzle-piece",
              children: [],
            },
          ],
        },
        {
          id: "system",
          href: "/admin/system",
          label: t("system_group"),
          active: pathname.includes("/admin/system"),
          icon: "heroicons:server-stack",
          submenus: [
            {
              href: "/admin/system/status",
              label: t("system_status"),
              active: pathname === "/admin/system/status",
              icon: "heroicons:heart",
              children: [],
            },
            {
              href: "/admin/system/logs",
              label: t("system_logs"),
              active: pathname === "/admin/system/logs",
              icon: "heroicons:document-text",
              children: [],
            },
            {
              href: "/admin/system/backup",
              label: t("backup_recovery"),
              active: pathname === "/admin/system/backup",
              icon: "heroicons:arrow-path",
              children: [],
            },
            {
              href: "/admin/system/maintenance",
              label: t("maintenance"),
              active: pathname === "/admin/system/maintenance",
              icon: "heroicons:wrench",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "",
      id: "changelog",
      menus: [
        {
          id: "changelog",
          href: "/changelog",
          label: t("changelog"),
          active: pathname.includes("/changelog"),
          icon: "heroicons:document-minus",
          submenus: [],
        },
      ],
    },
  ];
}

export function getHorizontalMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard/analytics",
          label: t("dashboard"),
          active: pathname.includes("/dashboard"),
          icon: "heroicons-outline:home",
          submenus: [
            {
              href: "/dashboard/analytics",
              label: t("analytics"),
              active: pathname === "/dashboard/analytics",
              icon: "heroicons:chart-bar-square",
              children: [],
            },
            {
              href: "/dashboard/overview",
              label: t("security_overview"),
              active: pathname === "/dashboard/overview",
              icon: "heroicons:shield-check",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("security_tools_group"),
      id: "security-tools",
      menus: [
        {
          id: "security-tools",
          href: "/security/vulnerability-scanner",
          label: t("security_tools_group"),
          active: pathname.includes("/security"),
          icon: "heroicons:wrench-screwdriver",
          submenus: [
            {
              href: "/security/vulnerability-scanner",
              label: t("vulnerability_scanner"),
              active: pathname.includes("/security/vulnerability-scanner"),
              icon: "heroicons:magnifying-glass",
              children: [
                {
                  href: "/security/vulnerability-scanner/new-scan",
                  label: t("new_scan"),
                  active: pathname === "/security/vulnerability-scanner/new-scan",
                },
                {
                  href: "/security/vulnerability-scanner/scan-history",
                  label: t("scan_history"),
                  active: pathname === "/security/vulnerability-scanner/scan-history",
                },
              ],
            },
            {
              href: "/security/attack-builder",
              label: t("attack_builder"),
              active: pathname.includes("/security/attack-builder"),
              icon: "heroicons:wrench-screwdriver",
              children: [
                {
                  href: "/security/attack-builder/create",
                  label: t("create_new_attack"),
                  active: pathname === "/security/attack-builder/create",
                },
                {
                  href: "/security/attack-builder/template",
                  label: t("attack_templates"),
                  active: pathname === "/security/attack-builder/template",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("reports"),
      id: "reports",
      menus: [
        {
          id: "reports",
          href: "/reports/security",
          label: t("reports"),
          active: pathname.includes("/reports"),
          icon: "heroicons:document-text",
          submenus: [
            {
              href: "/reports/security",
              label: t("security_reports"),
              active: pathname === "/reports/security",
              icon: "heroicons:shield-exclamation",
              children: [
                {
                  href: "/reports/security/vulnerability",
                  label: t("vulnerability_report"),
                  active: pathname === "/reports/security/vulnerability",
                },
                {
                  href: "/reports/security/compliance",
                  label: t("compliance_report"),
                  active: pathname === "/reports/security/compliance",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("analytics"),
      id: "analytics",
      menus: [
        {
          id: "analytics",
          href: "/analytics/threat-intelligence",
          label: t("analytics"),
          active: pathname.includes("/analytics"),
          icon: "heroicons:chart-pie",
          submenus: [
            {
              href: "/analytics/threat-intelligence",
              label: t("threat_intelligence"),
              active: pathname === "/analytics/threat-intelligence",
              icon: "heroicons:eye",
              children: [],
            },
            {
              href: "/analytics/risk-analysis",
              label: t("risk_analysis"),
              active: pathname === "/analytics/risk-analysis",
              icon: "heroicons:exclamation-triangle",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("administration_group"),
      id: "administration",
      menus: [
        {
          id: "administration",
          href: "/admin/settings",
          label: t("administration_group"),
          active: pathname.includes("/admin"),
          icon: "heroicons:cog-8-tooth",
          submenus: [
            {
              href: "/admin/settings",
              label: t("settings"),
              active: pathname.includes("/admin/settings"),
              icon: "heroicons:cog-8-tooth",
              children: [
                {
                  href: "/admin/settings/general",
                  label: t("general_settings"),
                  active: pathname === "/admin/settings/general",
                },
                {
                  href: "/admin/settings/security",
                  label: t("security_settings"),
                  active: pathname === "/admin/settings/security",
                },
              ],
            },
            {
              href: "/admin/users",
              label: t("user_management"),
              active: pathname.includes("/admin/users"),
              icon: "heroicons:users",
              children: [
                {
                  href: "/admin/users/manage",
                  label: t("manage_users"),
                  active: pathname === "/admin/users/manage",
                },
                {
                  href: "/admin/users/roles",
                  label: t("roles_permissions"),
                  active: pathname === "/admin/users/roles",
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}
