import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Kpi from '../components/Kpi';
import Drawer from '../components/Drawer';
import Avatar from '../components/Avatar';
import StatusPill from '../components/StatusPill';
import Tag from '../components/Tag';
import Progress from '../components/Progress';
import Sparkline from '../components/Sparkline';
import FormField from '../components/FormField';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import RatingPills from '../components/RatingPills';
import PersonSelect from '../components/PersonSelect';
import {
  performanceSummary,
  companyObjectives,
  initialGoals,
  initialKpis,
  kpiHistoricalData,
  evaluationCycleInfo,
  competenciesConfig,
  teamEvaluationStatuses,
  feedbackTimeline,
  employeePerformanceHistory,
} from '../data/performance';
import {
  Target,
  BarChart3,
  Award,
  MessageSquare,
  History,
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const TABS = [
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'kpis', label: 'KPIs', icon: BarChart3 },
  { id: 'evaluation', label: 'Evaluation', icon: Award },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'history', label: 'History', icon: History },
];

export default function Performance({ employees = [], onTriggerToast }) {
  // Sync tab with URL
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'goals';
  });

  const [selectedPerson, setSelectedPerson] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') !== activeTab) {
      params.set('tab', activeTab);
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  }, [activeTab]);

  // Goals State
  const [goals, setGoals] = useState(initialGoals);
  const [groupBy, setGroupBy] = useState('person'); // 'person' | 'objective'
  const [isGoalDrawerOpen, setIsGoalDrawerOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // New Goal Form State
  const [goalForm, setGoalForm] = useState({
    employeeId: employees[0]?.id || 'EMP-001',
    title: '',
    description: '',
    keyResults: [{ text: '', target: '100', unit: '%' }],
    weight: 25,
    startDate: '1 Oct 2026',
    dueDate: '31 Dec 2026',
    priority: 'High',
    alignment: companyObjectives[0]?.id || 'OBJ-1',
  });
  const [goalErrors, setGoalErrors] = useState({});

  // KPIs State
  const [kpiList, setKpiList] = useState(initialKpis);
  const [selectedKpiId, setSelectedKpiId] = useState('KPI-1');
  const [kpiRange, setKpiRange] = useState('30D'); // '30D' | 'Quarter' | 'Year'
  const [isUpdateKpiOpen, setIsUpdateKpiOpen] = useState(false);
  const [kpiUpdateVal, setKpiUpdateVal] = useState('');
  const [kpiUpdateNote, setKpiUpdateNote] = useState('');

  // Evaluation State
  const [evalStatuses, setEvalStatuses] = useState(teamEvaluationStatuses);
  const [evaluatingPerson, setEvaluatingPerson] = useState(null); // active employee for full-width evaluation panel
  const [evalForm, setEvalForm] = useState({
    ratings: {
      delivery: 4,
      quality: 4,
      ownership: 4,
      collaboration: 4,
      communication: 4,
      learning: 4,
    },
    strengths: '',
    improvement: '',
    promotionReadiness: 'In 6 months',
  });

  // Feedback State
  const [feedbacks, setFeedbacks] = useState(feedbackTimeline);
  const [feedbackType, setFeedbackType] = useState('Appreciation');
  const [feedbackVisibility, setFeedbackVisibility] = useState('Visible to employee');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRecipient, setFeedbackRecipient] = useState(employees[0]?.id || 'EMP-001');
  const [feedbackTags, setFeedbackTags] = useState(['Delivery']);

  // History State
  const [historyTargetId, setHistoryTargetId] = useState(employees[0]?.id || 'EMP-001');
  const [viewingPastReview, setViewingPastReview] = useState(null);

  // Helper for Toast with Undo
  const notify = (msg, undoFn) => {
    if (onTriggerToast) onTriggerToast(msg, undoFn);
  };

  // ----------------- GOALS LOGIC -----------------
  const filteredGoals = goals.filter((g) => {
    if (selectedPerson !== 'all' && g.employeeId !== selectedPerson) return false;
    return true;
  });

  // Calculate live weight sum for target employee
  const currentWeightSum = goals
    .filter((g) => g.employeeId === goalForm.employeeId)
    .reduce((acc, curr) => acc + (curr.weight || 0), 0);

  const handleSaveGoal = (isDraft = false) => {
    const errs = {};
    if (!goalForm.title.trim()) errs.title = 'Goal title is required';
    if (!goalForm.weight || goalForm.weight <= 0) errs.weight = 'Weight % must be positive';

    const empGoals = goals.filter((g) => g.employeeId === goalForm.employeeId);
    const existingWeight = empGoals.reduce((sum, g) => sum + g.weight, 0);
    const newTotal = existingWeight + Number(goalForm.weight);

    if (!isDraft && newTotal > 100) {
      errs.weight = `Total weight for employee would be ${newTotal}% (must not exceed 100%)`;
    }

    if (Object.keys(errs).length > 0) {
      setGoalErrors(errs);
      return;
    }

    const emp = employees.find((e) => e.id === goalForm.employeeId);
    const obj = companyObjectives.find((o) => o.id === goalForm.alignment);

    const newGoalObj = {
      id: `GOAL-${Date.now()}`,
      employeeId: goalForm.employeeId,
      employeeName: emp ? emp.name : 'Team Member',
      avatar: emp?.avatar || emp?.name?.slice(0, 2).toUpperCase() || 'EM',
      title: goalForm.title,
      description: goalForm.description,
      objectiveId: goalForm.alignment,
      objectiveTitle: obj?.title || 'Company Objective',
      type: 'Individual',
      keyResultsCount: goalForm.keyResults.length,
      weight: Number(goalForm.weight),
      progress: isDraft ? 0 : 10,
      status: 'On track',
      dueDate: goalForm.dueDate,
      startDate: goalForm.startDate,
      priority: goalForm.priority,
      needsApproval: false,
    };

    const prevGoals = [...goals];
    setGoals([newGoalObj, ...goals]);
    setIsGoalDrawerOpen(false);
    setGoalForm({
      employeeId: employees[0]?.id || 'EMP-001',
      title: '',
      description: '',
      keyResults: [{ text: '', target: '100', unit: '%' }],
      weight: 25,
      startDate: '1 Oct 2026',
      dueDate: '31 Dec 2026',
      priority: 'High',
      alignment: companyObjectives[0]?.id || 'OBJ-1',
    });
    setGoalErrors({});

    notify(
      isDraft ? 'Goal saved as draft' : `Goal assigned to ${newGoalObj.employeeName}`,
      () => setGoals(prevGoals)
    );
  };

  const handleDeleteGoal = (goalId) => {
    const prev = [...goals];
    const target = goals.find((g) => g.id === goalId);
    setGoals(goals.filter((g) => g.id !== goalId));
    notify(`Deleted goal: ${target?.title}`, () => setGoals(prev));
  };

  const handleApproveGoal = (goalId) => {
    const prev = [...goals];
    setGoals(
      goals.map((g) =>
        g.id === goalId ? { ...g, needsApproval: false, status: 'On track' } : g
      )
    );
    notify('Employee goal approved', () => setGoals(prev));
  };

  // ----------------- KPI LOGIC -----------------
  const activeKpi = kpiList.find((k) => k.id === selectedKpiId) || kpiList[0];
  const chartPoints =
    kpiHistoricalData[selectedKpiId]?.[kpiRange] ||
    kpiHistoricalData['KPI-1']?.[kpiRange] || [
      { date: 'W1', value: 55 },
      { date: 'W2', value: 60 },
      { date: 'W3', value: 64 },
      { date: 'W4', value: 62 },
    ];

  const handleUpdateKpiSubmit = () => {
    if (!kpiUpdateVal) return;
    const prev = [...kpiList];
    const num = parseFloat(kpiUpdateVal);
    setKpiList(
      kpiList.map((k) =>
        k.id === selectedKpiId
          ? {
              ...k,
              actual: num,
              achievement: Math.round((num / (k.target || 1)) * 100),
              trend: [...k.trend.slice(1), num],
              lastUpdated: 'Today',
            }
          : k
      )
    );
    setIsUpdateKpiOpen(false);
    setKpiUpdateVal('');
    setKpiUpdateNote('');
    notify(`Updated actual for ${activeKpi.name} to ${num} ${activeKpi.unit}`, () =>
      setKpiList(prev)
    );
  };

  // ----------------- EVALUATION LOGIC -----------------
  const computeOverallRating = () => {
    let totalScore = 0;
    let totalWeight = 0;
    competenciesConfig.forEach((c) => {
      const rating = evalForm.ratings[c.id] || 3;
      totalScore += rating * c.weight;
      totalWeight += c.weight;
    });
    return (totalScore / totalWeight).toFixed(1);
  };

  const getRatingLabel = (score) => {
    const num = parseFloat(score);
    if (num >= 4.5) return 'Outstanding';
    if (num >= 4.0) return 'Exceeds expectations';
    if (num >= 3.0) return 'Meets expectations';
    return 'Needs improvement';
  };

  const handleSubmitEvaluation = () => {
    if (!evaluatingPerson) return;
    const score = computeOverallRating();
    const prev = [...evalStatuses];
    setEvalStatuses(
      evalStatuses.map((s) =>
        s.id === evaluatingPerson.id
          ? { ...s, status: 'Submitted', rating: parseFloat(score) }
          : s
      )
    );
    notify(
      `Evaluation submitted for ${evaluatingPerson.name} (${score} · ${getRatingLabel(score)})`,
      () => setEvalStatuses(prev)
    );
    setEvaluatingPerson(null);
  };

  // ----------------- FEEDBACK LOGIC -----------------
  const handleSendFeedback = () => {
    if (!feedbackMessage.trim()) return;
    const recipient = employees.find((e) => e.id === feedbackRecipient);
    const newFb = {
      id: `FB-${Date.now()}`,
      employeeId: feedbackRecipient,
      employeeName: recipient ? recipient.name : 'Team Member',
      avatar: recipient?.avatar || recipient?.name?.slice(0, 2).toUpperCase() || 'TM',
      type: feedbackType,
      message: feedbackMessage,
      date: '6 Nov 2026',
      visibility: feedbackVisibility,
      tags: feedbackTags,
    };
    const prev = [...feedbacks];
    setFeedbacks([newFb, ...feedbacks]);
    setFeedbackMessage('');
    notify(`Feedback delivered to ${newFb.employeeName}`, () => setFeedbacks(prev));
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Controls Strip with Subtitle and Person Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-muted">
          Goals, metrics, competency reviews and growth timelines
        </p>

        <div className="flex items-center gap-3 ml-auto">
          <PersonSelect
            employees={employees}
            selectedPerson={selectedPerson}
            onChange={setSelectedPerson}
            label="Filter team:"
          />
        </div>
      </div>

      {/* Team-wide Summary Strip (KPI tiles) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Kpi
          label="Team Goal Completion"
          value={`${performanceSummary.teamGoalCompletion}%`}
          change="Q3 FY26–27"
          sublabel="16 of 24 on track"
          trend="up"
        />
        <Kpi
          label="KPIs on Track"
          value={`${performanceSummary.kpisOnTrackCount} of ${performanceSummary.kpisTotalCount}`}
          change="8 Engineering metrics"
          sublabel="1 at risk, 1 behind"
          trend="neutral"
        />
        <Kpi
          label="Reviews Pending"
          value={performanceSummary.reviewsPending}
          change="Due 20 Nov 2026"
          sublabel="5 manager reviews left"
          trend="warn"
        />
        <Kpi
          label="Feedback Given"
          value={performanceSummary.feedbackGivenQuarter}
          change="This quarter"
          sublabel="14 total interactions"
          trend="up"
        />
      </div>

      {/* Tab bar (pills) */}
      <div
        role="tablist"
        aria-label="Performance sections"
        className="flex items-center gap-2 border-b border-line/40 pb-2 overflow-x-auto"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all select-none whitespace-nowrap border ${
                isActive
                  ? 'bg-accent text-on-accent border-accent shadow-sm'
                  : 'bg-surface2 text-muted border-line hover:text-ink hover:border-line/80'
              }`}
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4.1 SUBVIEW: GOALS */}
      {/* ======================================================== */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="goals"
            title="Team & Employee Goals"
            className="col-span-1 md:col-span-2"
            action={
              <div className="flex items-center gap-2">
                {/* Group by toggle */}
                <div className="flex items-center bg-surface2 rounded-lg p-0.5 border border-line text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setGroupBy('person')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      groupBy === 'person' ? 'bg-accent text-on-accent' : 'text-muted'
                    }`}
                  >
                    By Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupBy('objective')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      groupBy === 'objective' ? 'bg-accent text-on-accent' : 'text-muted'
                    }`}
                  >
                    By Objective
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGoalDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} strokeWidth={2.4} />
                  <span>Set new goal</span>
                </button>
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              {filteredGoals.length === 0 ? (
                <div className="py-12 text-center text-muted text-[13px]">
                  No goals match the selected filters.
                </div>
              ) : (
                filteredGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl bg-surface2/40 border border-line hover:border-line/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar name={goal.employeeName} size={34} />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-[13.5px] text-ink leading-tight truncate">
                            {goal.title}
                          </h4>
                          <Tag variant="default">{goal.type}</Tag>
                          <span className="text-[11px] text-muted font-mono">
                            Weight: {goal.weight}%
                          </span>
                          {goal.needsApproval && (
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-warn/20 text-warn border border-warn/40">
                              Needs your approval
                            </span>
                          )}
                        </div>

                        <p className="text-[11.5px] text-muted mt-1 line-clamp-1">
                          Aligned to:{' '}
                          <span className="text-ink/80 font-medium">{goal.objectiveTitle}</span>
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted">
                          <span>
                            {goal.keyResultsCount} key result{goal.keyResultsCount > 1 ? 's' : ''}
                          </span>
                          <span>Due: {goal.dueDate}</span>
                          <span className="font-mono text-ink font-semibold">
                            Progress: {goal.progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Progress Bar & Status & Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-28 flex flex-col gap-1">
                        <div className="w-full h-2 rounded-full bg-surface2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              goal.status === 'Behind'
                                ? 'bg-bad'
                                : goal.status === 'At risk'
                                ? 'bg-warn'
                                : 'bg-accent'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <StatusPill
                          status={
                            goal.status === 'On track'
                              ? 'good'
                              : goal.status === 'At risk'
                              ? 'warn'
                              : goal.status === 'Completed'
                              ? 'good'
                              : 'bad'
                          }
                          label={goal.status}
                          className="self-start text-[10.5px]"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        {goal.needsApproval ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveGoal(goal.id)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-accent text-on-accent flex items-center gap-1"
                              title="Approve employee goal"
                            >
                              <Check size={12} strokeWidth={2.4} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => notify('Requested changes from employee')}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface2 text-muted border border-line"
                            >
                              Request changes
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => notify(`Goal marked complete: ${goal.title}`)}
                              className="p-1.5 rounded-lg text-muted hover:text-good hover:bg-surface2 transition-colors"
                              title="Mark complete"
                            >
                              <Check size={14} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="p-1.5 rounded-lg text-muted hover:text-bad hover:bg-surface2 transition-colors"
                              title="Delete goal"
                            >
                              <Trash2 size={14} strokeWidth={1.8} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.2 SUBVIEW: KPIS */}
      {/* ======================================================== */}
      {activeTab === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="kpi"
            title="Engineering Key Performance Indicators"
            className="col-span-1 md:col-span-2"
            action={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateKpiOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold shadow-sm hover:opacity-90"
                >
                  <Edit2 size={13} />
                  <span>Update KPI actual</span>
                </button>
                <button
                  type="button"
                  onClick={() => notify('Exported KPI report to CSV')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12px] font-semibold"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
              </div>
            }
          >
            <div className="flex flex-col gap-6">
              {/* KPI Table */}
              <div className="overflow-x-auto w-full rounded-xl border border-line bg-surface/30">
                <table className="w-full border-collapse text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-line bg-surface2/50 text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                      <th className="py-2.5 px-3">KPI Name</th>
                      <th className="py-2.5 px-3">Owner</th>
                      <th className="py-2.5 px-3 text-right">Target</th>
                      <th className="py-2.5 px-3 text-right">Actual</th>
                      <th className="py-2.5 px-3 text-center w-28">Achievement</th>
                      <th className="py-2.5 px-3 text-center">Trend</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/30 text-[12.5px]">
                    {kpiList.map((kpi) => {
                      const isSelected = selectedKpiId === kpi.id;
                      return (
                        <tr
                          key={kpi.id}
                          onClick={() => setSelectedKpiId(kpi.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-surface2/90 border-l-2 border-accent' : 'hover:bg-surface2/40'
                          }`}
                        >
                          <td className="py-3 px-3 font-semibold text-ink flex items-center gap-2">
                            <span>{kpi.name}</span>
                          </td>
                          <td className="py-3 px-3 text-muted">{kpi.owner}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                            {kpi.target} {kpi.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-accent">
                            {kpi.actual} {kpi.unit}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[11px] font-mono text-ink">
                                {kpi.achievement}%
                              </span>
                              <div className="w-20 h-1.5 rounded-full bg-surface2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    kpi.achievement < 75
                                      ? 'bg-bad'
                                      : kpi.achievement < 90
                                      ? 'bg-warn'
                                      : 'bg-accent'
                                  }`}
                                  style={{ width: `${Math.min(kpi.achievement, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Sparkline
                              data={kpi.trend}
                              width={70}
                              height={20}
                              strokeColor={
                                kpi.status === 'Behind'
                                  ? 'var(--bad)'
                                  : kpi.status === 'At risk'
                                  ? 'var(--warn)'
                                  : 'var(--accent)'
                              }
                            />
                          </td>
                          <td className="py-3 px-3">
                            <StatusPill
                              status={
                                kpi.status === 'On track'
                                  ? 'good'
                                  : kpi.status === 'At risk'
                                  ? 'warn'
                                  : 'bad'
                              }
                              label={kpi.status}
                            />
                          </td>
                          <td className="py-3 px-3 text-muted text-[11px] font-mono">
                            {kpi.lastUpdated}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Line Chart Card for selected KPI */}
              <div className="p-4 rounded-2xl bg-surface2/30 border border-line flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-display font-bold text-[14px] text-ink">
                      Trend Analysis: {activeKpi.name}
                    </h4>
                    <p className="text-[11.5px] text-muted">
                      Target: {activeKpi.target} {activeKpi.unit} · Current: {activeKpi.actual}{' '}
                      {activeKpi.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-surface2 p-1 rounded-lg border border-line text-[11px] font-semibold">
                    {['30D', 'Quarter', 'Year'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setKpiRange(range)}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          kpiRange === range ? 'bg-accent text-on-accent' : 'text-muted'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div
                  role="img"
                  aria-label={`Historical trend chart for ${activeKpi.name} over ${kpiRange}`}
                  className="w-full h-44 relative pt-2"
                >
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140">
                    <line x1="0" y1="20" x2="500" y2="20" stroke="var(--line)" strokeDasharray="4 4" strokeWidth="0.8" />
                    <line x1="0" y1="65" x2="500" y2="65" stroke="var(--line)" strokeDasharray="4 4" strokeWidth="0.8" />
                    <line x1="0" y1="110" x2="500" y2="110" stroke="var(--line)" strokeDasharray="4 4" strokeWidth="0.8" />

                    {chartPoints.map((pt, idx) => {
                      const minVal = Math.min(...chartPoints.map((p) => p.value));
                      const maxVal = Math.max(...chartPoints.map((p) => p.value));
                      const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
                      const x = 30 + (idx / (chartPoints.length - 1)) * 440;
                      const y = 120 - ((pt.value - minVal) / range) * 90;
                      const isLast = idx === chartPoints.length - 1;

                      return (
                        <g key={pt.date}>
                          {idx > 0 && (
                            <line
                              x1={30 + ((idx - 1) / (chartPoints.length - 1)) * 440}
                              y1={120 - ((chartPoints[idx - 1].value - minVal) / range) * 90}
                              x2={x}
                              y2={y}
                              stroke="var(--accent)"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                            />
                          )}
                          <circle cx={x} cy={y} r={isLast ? '5' : '3.5'} fill="var(--accent)" />
                          <text x={x} y="138" textAnchor="middle" fontSize="10" fill="var(--muted)">
                            {pt.date}
                          </text>
                          {isLast && (
                            <text
                              x={x}
                              y={y - 10}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="bold"
                              fill="var(--ink)"
                            >
                              {pt.value} {activeKpi.unit}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.3 SUBVIEW: EVALUATION */}
      {/* ======================================================== */}
      {activeTab === 'evaluation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="eval"
            title="Quarterly Performance Review Cycle"
            className="col-span-1 md:col-span-2"
            action={
              <span className="text-[11px] font-mono text-muted">
                Manager reviews due: {evaluationCycleInfo.managerDueDate}
              </span>
            }
          >
            <div className="flex flex-col gap-6">
              {/* Review Cycle Stepper */}
              <div className="p-4 rounded-2xl bg-surface2/30 border border-line flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-display font-bold text-[14px] text-ink">
                    {evaluationCycleInfo.name} ({evaluationCycleInfo.period})
                  </h4>
                  <span className="text-[12px] font-semibold text-accent">
                    {evaluationCycleInfo.selfReviewsSubmitted} of{' '}
                    {evaluationCycleInfo.totalTeamCount} self-reviews submitted
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-surface2 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{
                      width: `${(evaluationCycleInfo.selfReviewsSubmitted /
                        evaluationCycleInfo.totalTeamCount) *
                        100}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-line/40 text-[11.5px]">
                  {evaluationCycleInfo.steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isDone = stepNum < evaluationCycleInfo.currentStep;
                    const isCurrent = stepNum === evaluationCycleInfo.currentStep;

                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isDone
                              ? 'bg-good text-[#06141c]'
                              : isCurrent
                              ? 'bg-accent text-on-accent ring-2 ring-accent/40'
                              : 'bg-surface2 text-muted border border-line'
                          }`}
                        >
                          {isDone ? <Check size={11} strokeWidth={2.4} /> : stepNum}
                        </div>
                        <span
                          className={`truncate font-medium ${
                            isCurrent ? 'text-ink font-bold' : 'text-muted'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Segmented Bar for Team Rating Distribution */}
              <div className="p-3.5 rounded-xl bg-surface2/20 border border-line flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="font-bold text-ink uppercase tracking-wider font-mono">
                    Team Rating Distribution
                  </span>
                  <span className="text-muted text-[11px]">24 Total Team Members</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface2 overflow-hidden flex">
                  {evaluationCycleInfo.ratingDistribution.map((dist) => (
                    <div
                      key={dist.label}
                      style={{ width: `${dist.pct}%`, backgroundColor: dist.color }}
                      title={`${dist.label}: ${dist.count} (${dist.pct}%)`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2 text-[10.5px] text-muted pt-1">
                  {evaluationCycleInfo.ratingDistribution.map((dist) => (
                    <span key={dist.label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dist.color }} />
                      <span>{dist.label}:</span>
                      <strong className="text-ink font-mono">{dist.count}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Full-width Form Panel (Inside Card) when an employee is selected */}
              {evaluatingPerson ? (
                <div className="p-5 rounded-2xl bg-surface2/60 border border-accent/60 flex flex-col gap-5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={evaluatingPerson.name} size={38} />
                      <div>
                        <h3 className="font-display font-extrabold text-[16px] text-ink">
                          Evaluate: {evaluatingPerson.name}
                        </h3>
                        <p className="text-[12px] text-muted">
                          {evaluatingPerson.role} · Q3 FY26–27 Manager Evaluation
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEvaluatingPerson(null)}
                      className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface2"
                      title="Close evaluation panel"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                        Competency Ratings (Scale 1–5)
                      </h4>

                      {competenciesConfig.map((comp) => (
                        <div
                          key={comp.id}
                          className="p-3 rounded-xl bg-surface border border-line/60 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-ink">
                              {comp.name}
                            </span>
                            <span className="text-[11px] font-mono text-muted">
                              Weight: {comp.weight}%
                            </span>
                          </div>
                          <p className="text-[11px] text-muted">{comp.description}</p>
                          <RatingPills
                            name={comp.name}
                            value={evalForm.ratings[comp.id]}
                            onChange={(val) =>
                              setEvalForm((prev) => ({
                                ...prev,
                                ratings: { ...prev.ratings, [comp.id]: val },
                              }))
                            }
                          />
                        </div>
                      ))}

                      <FormField label="Key Strengths Demonstrated" id="eval-strengths">
                        <Textarea
                          id="eval-strengths"
                          value={evalForm.strengths}
                          onChange={(e) =>
                            setEvalForm((prev) => ({ ...prev, strengths: e.target.value }))
                          }
                          placeholder="Highlight outstanding contributions, technical leadership, and accomplishments..."
                          rows={3}
                        />
                      </FormField>

                      <FormField label="Areas for Growth & Improvement" id="eval-improvement">
                        <Textarea
                          id="eval-improvement"
                          value={evalForm.improvement}
                          onChange={(e) =>
                            setEvalForm((prev) => ({ ...prev, improvement: e.target.value }))
                          }
                          placeholder="Constructive action items, technical depth, or communication goals for next cycle..."
                          rows={3}
                        />
                      </FormField>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Promotion Readiness" id="eval-promo">
                          <Select
                            id="eval-promo"
                            value={evalForm.promotionReadiness}
                            onChange={(e) =>
                              setEvalForm((prev) => ({
                                ...prev,
                                promotionReadiness: e.target.value,
                              }))
                            }
                            options={['Not yet', 'In 6 months', 'Ready']}
                          />
                        </FormField>

                        <div className="p-3 rounded-xl bg-surface border border-line/60 flex flex-col justify-center">
                          <span className="text-[11px] font-semibold text-muted uppercase">
                            Computed Overall Rating
                          </span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-display font-extrabold text-[22px] text-accent">
                              {computeOverallRating()} / 5.0
                            </span>
                            <span className="text-[12px] font-bold text-ink">
                              ({getRatingLabel(computeOverallRating())})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/50">
                        <button
                          type="button"
                          onClick={() => {
                            notify('Evaluation saved as draft');
                            setEvaluatingPerson(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12.5px] font-semibold"
                        >
                          Save draft
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitEvaluation}
                          className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90"
                        >
                          Submit evaluation
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-surface border border-line flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-muted">
                        <Clock size={15} />
                        <h5 className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                          Employee Self-Review
                        </h5>
                      </div>

                      <div className="text-[11.5px] text-ink/90 leading-relaxed bg-surface2/40 p-3 rounded-lg border border-line/40">
                        <strong className="text-accent block mb-1">Self Assessment:</strong>
                        "Successfully led the Monsoon Glass token architecture rollout across 12 views. Mentored 2 engineers and achieved 92% on-time delivery across Sprint commitments."
                      </div>

                      <div className="text-[11.5px] text-ink/90 leading-relaxed bg-surface2/40 p-3 rounded-lg border border-line/40">
                        <strong className="text-accent block mb-1">Goal Achievement:</strong>
                        Self-reported 88% average key result achievement across Q3 deliverables.
                      </div>

                      <div className="text-[11.5px] text-ink/90 leading-relaxed bg-surface2/40 p-3 rounded-lg border border-line/40">
                        <strong className="text-accent block mb-1">Aspirations:</strong>
                        "Interested in leading frontend architecture reviews and representing our team in guild town halls."
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Team Members List */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                  Team Members Review Status
                </h4>

                <div className="divide-y divide-line/30 rounded-xl border border-line overflow-hidden bg-surface/30">
                  {evalStatuses.map((member) => (
                    <div
                      key={member.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface2/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={member.name} size={32} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-semibold text-ink truncate">
                            {member.name}
                          </span>
                          <span className="text-[11px] text-muted truncate">{member.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {member.rating ? (
                          <span className="text-[12px] font-mono font-bold text-accent">
                            Rating: {member.rating}
                          </span>
                        ) : null}

                        <StatusPill
                          status={
                            member.status === 'Submitted'
                              ? 'good'
                              : member.status === 'Self review done'
                              ? 'info'
                              : member.status === 'In progress'
                              ? 'warn'
                              : 'bad'
                          }
                          label={member.status}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setEvaluatingPerson(member);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold hover:opacity-90 shadow-sm"
                        >
                          Evaluate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.4 SUBVIEW: FEEDBACK */}
      {/* ======================================================== */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="feedback"
            title="Continuous Feedback & Mentorship"
            className="col-span-1 md:col-span-2"
            action={
              <button
                type="button"
                onClick={() => notify('Requested peer feedback for team members via Slack')}
                className="px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12px] font-semibold"
              >
                Request feedback from peers
              </button>
            }
          >
            <div className="flex flex-col gap-6">
              <div className="p-4 rounded-2xl bg-surface2/40 border border-line flex flex-col gap-4">
                <h4 className="font-display font-bold text-[14px] text-ink">
                  Give Feedback or Private Coaching Note
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label="Recipient" id="fb-recipient">
                    <Select
                      id="fb-recipient"
                      value={feedbackRecipient}
                      onChange={(e) => setFeedbackRecipient(e.target.value)}
                      options={employees.map((e) => ({ value: e.id, label: e.name }))}
                    />
                  </FormField>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-semibold text-ink">Feedback Type</label>
                    <div className="flex items-center gap-1.5">
                      {['Appreciation', 'Constructive', 'Coaching'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFeedbackType(type)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all ${
                            feedbackType === type
                              ? 'bg-accent text-on-accent border-accent'
                              : 'bg-surface2 text-muted border-line hover:text-ink'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-semibold text-ink">Visibility</label>
                    <div className="flex items-center gap-1.5">
                      {['Visible to employee', 'Private note to self'].map((vis) => (
                        <button
                          key={vis}
                          type="button"
                          onClick={() => setFeedbackVisibility(vis)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                            feedbackVisibility === vis
                              ? 'bg-surface text-ink border-accent'
                              : 'bg-surface2 text-muted border-line hover:text-ink'
                          }`}
                        >
                          {vis}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <FormField label="Message (max 500 characters)" id="fb-msg">
                  <Textarea
                    id="fb-msg"
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Provide actionable praise, coaching observations, or specific performance feedback..."
                    maxLength={500}
                    showCounter
                    rows={3}
                  />
                </FormField>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-line/40">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted">
                    <span className="font-semibold">Tags:</span>
                    {['Delivery', 'Quality', 'Ownership', 'Teamwork'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setFeedbackTags(
                            feedbackTags.includes(t)
                              ? feedbackTags.filter((x) => x !== t)
                              : [...feedbackTags, t]
                          )
                        }
                        className={`px-2 py-0.5 rounded-md text-[10.5px] border ${
                          feedbackTags.includes(t)
                            ? 'bg-accent/20 border-accent/40 text-accent font-bold'
                            : 'bg-surface2 border-line text-muted'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendFeedback}
                    className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90"
                  >
                    Send feedback
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                  Feedback History Timeline
                </h4>

                <div className="flex flex-col divide-y divide-dashed divide-line/60">
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className="py-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={fb.employeeName} size={28} />
                          <span className="text-[13px] font-bold text-ink">
                            {fb.employeeName}
                          </span>
                          <Tag
                            variant={
                              fb.type === 'Appreciation'
                                ? 'accent'
                                : fb.type === 'Coaching'
                                ? 'default'
                                : 'warn'
                            }
                          >
                            {fb.type}
                          </Tag>
                          <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-surface2 text-muted border border-line">
                            {fb.visibility}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-muted">{fb.date}</span>
                      </div>

                      <p className="text-[12.5px] text-ink/90 leading-relaxed pl-9">
                        {fb.message}
                      </p>

                      {fb.tags?.length > 0 && (
                        <div className="flex items-center gap-1.5 pl-9">
                          {fb.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-mono text-muted bg-surface2 px-1.5 py-0.2 rounded border border-line/30"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.5 SUBVIEW: HISTORY */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="history"
            title="Performance History & Milestones"
            className="col-span-1 md:col-span-2"
            action={
              <PersonSelect
                employees={employees}
                selectedPerson={historyTargetId}
                onChange={setHistoryTargetId}
                showAllOption={false}
                label="Employee:"
              />
            }
          >
            {(() => {
              const hist =
                employeePerformanceHistory[historyTargetId] ||
                employeePerformanceHistory['EMP-001'];

              return (
                <div className="flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-surface2/30 border border-line flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={hist.name} size={42} />
                      <div>
                        <h3 className="font-display font-extrabold text-[16px] text-ink">
                          {hist.name}
                        </h3>
                        <p className="text-[12px] text-muted">
                          {hist.role} · Tenure: {hist.tenure}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                          Current Rating
                        </span>
                        <span className="font-display font-extrabold text-[20px] text-accent">
                          {hist.currentRating} / 5.0
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface2/20 border border-line flex flex-col gap-3">
                    <h4 className="font-display font-bold text-[13.5px] text-ink">
                      Cycle Rating Trajectory (Last 6 Review Cycles)
                    </h4>

                    <div
                      role="img"
                      aria-label={`Cycle rating history for ${hist.name}`}
                      className="w-full h-36 relative pt-2"
                    >
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 110">
                        <line x1="0" y1="20" x2="500" y2="20" stroke="var(--line)" strokeDasharray="4 4" strokeWidth="0.8" />
                        <line x1="0" y1="55" x2="500" y2="55" stroke="var(--line)" strokeDasharray="4 4" strokeWidth="0.8" />
                        <line x1="0" y1="90" x2="500" y2="90" stroke="var(--line)" strokeDasharray="4 4" strokeWidth="0.8" />

                        {hist.trendRatings.map((pt, idx) => {
                          const x = 30 + (idx / (hist.trendRatings.length - 1)) * 440;
                          const y = 90 - ((pt.rating - 3.5) / 1.5) * 70;
                          const isLast = idx === hist.trendRatings.length - 1;

                          return (
                            <g key={pt.cycle}>
                              {idx > 0 && (
                                <line
                                  x1={30 + ((idx - 1) / (hist.trendRatings.length - 1)) * 440}
                                  y1={
                                    90 -
                                    ((hist.trendRatings[idx - 1].rating - 3.5) / 1.5) * 70
                                  }
                                  x2={x}
                                  y2={y}
                                  stroke="var(--accent)"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                />
                              )}
                              <circle cx={x} cy={y} r={isLast ? '5' : '3.5'} fill="var(--accent)" />
                              <text x={x} y="105" textAnchor="middle" fontSize="10" fill="var(--muted)">
                                {pt.cycle}
                              </text>
                              {isLast && (
                                <text
                                  x={x}
                                  y={y - 8}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fontWeight="bold"
                                  fill="var(--ink)"
                                >
                                  {pt.rating}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                      Past Evaluation Cycles
                    </h4>

                    <div className="overflow-x-auto w-full rounded-xl border border-line bg-surface/30">
                      <table className="w-full border-collapse text-left min-w-[650px] text-[12.5px]">
                        <thead>
                          <tr className="border-b border-line bg-surface2/50 text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                            <th className="py-2.5 px-3">Cycle</th>
                            <th className="py-2.5 px-3">Goals Achieved</th>
                            <th className="py-2.5 px-3">Overall Rating</th>
                            <th className="py-2.5 px-3">Promotion Readiness</th>
                            <th className="py-2.5 px-3">Manager Summary</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line/30">
                          {hist.pastCycles.map((c) => (
                            <tr key={c.cycle} className="hover:bg-surface2/40 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-ink">{c.cycle}</td>
                              <td className="py-2.5 px-3 font-mono text-accent">
                                {c.goalsAchieved}%
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-ink">
                                {c.overallRating} / 5.0
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface2 text-muted border border-line">
                                  {c.promotionReadiness}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-muted text-[12px] max-w-xs truncate">
                                {c.managerComment}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setViewingPastReview(c)}
                                  className="text-[12px] text-accent hover:underline font-semibold"
                                >
                                  View full review
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                      Milestones, Promotions & Awards
                    </h4>

                    <div className="flex flex-col divide-y divide-dashed divide-line/60">
                      {hist.milestones.map((m) => (
                        <div key={m.title} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-surface2 border border-line flex items-center justify-center text-accent shrink-0">
                              <Award size={14} />
                            </div>
                            <div>
                              <span className="text-[13px] font-semibold text-ink">{m.title}</span>
                              <span className="text-[11px] text-muted ml-2">({m.type})</span>
                            </div>
                          </div>
                          <span className="text-[11.5px] font-mono text-muted">{m.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {/* DRAWERS: Set Goal Drawer */}
      <Drawer
        isOpen={isGoalDrawerOpen}
        onClose={() => setIsGoalDrawerOpen(false)}
        title="Set New Employee Goal"
        width="540px"
      >
        <div className="flex flex-col gap-4">
          <FormField
            label="Employee"
            id="goal-emp"
            error={goalErrors.employeeId}
            required
          >
            <Select
              id="goal-emp"
              value={goalForm.employeeId}
              onChange={(e) => setGoalForm({ ...goalForm, employeeId: e.target.value })}
              options={employees.map((e) => ({ value: e.id, label: e.name }))}
            />
          </FormField>

          <FormField label="Goal Title" id="goal-title" error={goalErrors.title} required>
            <input
              id="goal-title"
              type="text"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              placeholder="e.g. Optimize Redis Cache Layer for Latency"
              className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line focus:border-accent outline-none"
            />
          </FormField>

          <FormField label="Description" id="goal-desc">
            <Textarea
              id="goal-desc"
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              placeholder="Explain the technical scope, success criteria, and deliverables..."
              rows={2}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Weight %"
              id="goal-weight"
              hint={`Current sum: ${currentWeightSum}%`}
              error={goalErrors.weight}
              required
            >
              <input
                id="goal-weight"
                type="number"
                min="5"
                max="100"
                value={goalForm.weight}
                onChange={(e) => setGoalForm({ ...goalForm, weight: e.target.value })}
                className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line focus:border-accent outline-none font-mono"
              />
            </FormField>

            <FormField label="Priority" id="goal-priority">
              <Select
                id="goal-priority"
                value={goalForm.priority}
                onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })}
                options={['Low', 'Medium', 'High']}
              />
            </FormField>
          </div>

          <FormField label="Align to Company Objective" id="goal-align">
            <Select
              id="goal-align"
              value={goalForm.alignment}
              onChange={(e) => setGoalForm({ ...goalForm, alignment: e.target.value })}
              options={companyObjectives.map((o) => ({ value: o.id, label: o.title }))}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" id="goal-start">
              <input
                id="goal-start"
                type="text"
                value={goalForm.startDate}
                onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })}
                className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line font-mono"
              />
            </FormField>
            <FormField label="Due Date" id="goal-due">
              <input
                id="goal-due"
                type="text"
                value={goalForm.dueDate}
                onChange={(e) => setGoalForm({ ...goalForm, dueDate: e.target.value })}
                className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line font-mono"
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line mt-2">
            <button
              type="button"
              onClick={() => handleSaveGoal(true)}
              className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12.5px] font-semibold"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveGoal(false)}
              className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90"
            >
              Assign goal
            </button>
          </div>
        </div>
      </Drawer>

      {/* DRAWERS: Update KPI Actual */}
      <Drawer
        isOpen={isUpdateKpiOpen}
        onClose={() => setIsUpdateKpiOpen(false)}
        title={`Update KPI: ${activeKpi?.name}`}
        width="440px"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[12.5px] text-muted">
            Target: <strong className="text-ink">{activeKpi?.target} {activeKpi?.unit}</strong> · Current Actual: <strong className="text-accent">{activeKpi?.actual} {activeKpi?.unit}</strong>
          </p>

          <FormField label="New Actual Value" id="kpi-new-val" required>
            <input
              id="kpi-new-val"
              type="number"
              step="any"
              value={kpiUpdateVal}
              onChange={(e) => setKpiUpdateVal(e.target.value)}
              placeholder={`Enter numeric actual in ${activeKpi?.unit}`}
              className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line focus:border-accent outline-none font-mono"
            />
          </FormField>

          <FormField label="Update Note" id="kpi-note">
            <Textarea
              id="kpi-note"
              value={kpiUpdateNote}
              onChange={(e) => setKpiUpdateNote(e.target.value)}
              placeholder="e.g. Sprint 44 closed with 64 story points burned down..."
              rows={2}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
            <button
              type="button"
              onClick={() => setIsUpdateKpiOpen(false)}
              className="px-3.5 py-2 rounded-xl bg-surface2 text-muted border border-line text-[12.5px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateKpiSubmit}
              className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90"
            >
              Save Update
            </button>
          </div>
        </div>
      </Drawer>

      {/* DRAWERS: View Past Review Detail */}
      <Drawer
        isOpen={Boolean(viewingPastReview)}
        onClose={() => setViewingPastReview(null)}
        title={`Performance Review: ${viewingPastReview?.cycle}`}
        width="460px"
      >
        {viewingPastReview && (
          <div className="flex flex-col gap-4 text-[13px]">
            <div className="p-3.5 rounded-xl bg-surface2 border border-line flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted uppercase font-mono">Overall Rating</span>
                <div className="font-display font-extrabold text-[20px] text-accent">
                  {viewingPastReview.overallRating} / 5.0
                </div>
              </div>
              <div>
                <span className="text-[11px] text-muted uppercase font-mono">Goals Achieved</span>
                <div className="font-mono font-bold text-[18px] text-ink">
                  {viewingPastReview.goalsAchieved}%
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-ink text-[12px] uppercase tracking-wider font-mono text-muted mb-1">
                Manager Assessment
              </h5>
              <p className="text-ink/90 leading-relaxed bg-surface2/30 p-3 rounded-xl border border-line/40">
                {viewingPastReview.managerComment}
              </p>
            </div>

            <div>
              <h5 className="font-bold text-ink text-[12px] uppercase tracking-wider font-mono text-muted mb-1">
                Promotion Readiness
              </h5>
              <span className="inline-block px-3 py-1 rounded-full text-[12px] font-bold bg-accent/20 text-accent border border-accent/40">
                {viewingPastReview.promotionReadiness}
              </span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
