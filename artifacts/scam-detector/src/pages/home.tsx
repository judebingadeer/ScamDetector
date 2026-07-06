import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, Shield, Info, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RiskLevel = "Safe" | "Suspicious" | "Possible Scam";

interface AnalysisResult {
  score: number;
  level: RiskLevel;
  reasons: string[];
}

interface IndicatorRule {
  keywords: string[];
  weight: number;
  reason: string;
}

const URGENT_RULE: IndicatorRule = {
  keywords: ["urgent", "immediately", "within 24 hours", "final warning", "account suspended", "act now", "last chance"],
  weight: 15,
  reason: "Contains urgent language pressuring you to act quickly.",
};
const SENSITIVE_INFO_RULE: IndicatorRule = {
  keywords: ["password", "otp", "verification code", "pin", "bank card", "credit card", "cvv"],
  weight: 20,
  reason: "Asks for sensitive personal or financial information.",
};
const SHORTENED_URL_RULE: IndicatorRule = {
  keywords: ["bit.ly", "tinyurl", "t.co", "goo.gl", "ow.ly"],
  weight: 20,
  reason: "Contains a shortened link, often used to hide the real destination.",
};
const OFFER_RULE: IndicatorRule = {
  keywords: ["you won", "free money", "prize", "lottery", "reward", "claim your gift"],
  weight: 15,
  reason: "Promises a prize, reward, or offer that seems too good to be true.",
};
const THREAT_RULE: IndicatorRule = {
  keywords: ["legal action", "arrest", "penalty", "your account will be closed", "failure to comply"],
  weight: 20,
  reason: "Uses threatening language to intimidate you into responding.",
};
const VERIFY_RULE: IndicatorRule = {
  keywords: ["verify your account", "confirm your account", "update your account", "verify your identity", "click the link"],
  weight: 15,
  reason: "Asks you to verify or confirm your account details.",
};

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

function analyzeMessage(message: string): AnalysisResult {
  const lowerText = message.toLowerCase();
  const reasons: string[] = [];
  let score = 0;
  const rules = [URGENT_RULE, SENSITIVE_INFO_RULE, OFFER_RULE, THREAT_RULE, VERIFY_RULE];
  
  rules.forEach((rule) => {
    if (containsAny(lowerText, rule.keywords)) { 
      score += rule.weight; 
      reasons.push(rule.reason); 
    }
  });
  
  if (containsAny(lowerText, SHORTENED_URL_RULE.keywords)) {
    score += SHORTENED_URL_RULE.weight; 
    reasons.push(SHORTENED_URL_RULE.reason);
  } else if (URL_REGEX.test(lowerText)) {
    score += 10; 
    reasons.push("Contains a link. Be cautious before clicking any URL.");
  }
  
  if (score > 100) score = 100;
  
  let level: RiskLevel;
  if (score <= 30) level = "Safe";
  else if (score <= 65) level = "Suspicious";
  else level = "Possible Scam";
  
  if (reasons.length === 0) {
    reasons.push("No common scam indicators were detected in this message.");
  }
  
  return { score, level, reasons };
}

function getSafetyTips(level: RiskLevel): string[] {
  if (level === "Safe") return [
    "This message looks relatively safe, but always stay cautious.",
    "If you are unsure about the sender, verify through an official channel.",
    "Never share sensitive information unless you are fully certain of the source.",
  ];
  if (level === "Suspicious") return [
    "Do not click on any links included in this message.",
    "Do not share personal, financial, or account information.",
    "Contact the organization directly using their official website or phone number.",
    "Take your time. Legitimate organizations rarely demand instant action.",
  ];
  return [
    "Do not click any links in this message.",
    "Do not reply to the sender.",
    "Never share passwords, OTPs, PINs, or card details.",
    "Report this message to your email or phone provider.",
    "Delete the message after reporting it.",
    "If you already shared information, contact your bank or service provider immediately.",
  ];
}

const getLevelColors = (level: RiskLevel) => {
  switch (level) {
    case "Safe":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        bar: "bg-emerald-500",
        icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />
      };
    case "Suspicious":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        bar: "bg-amber-500",
        icon: <ShieldAlert className="w-6 h-6 text-amber-600" />
      };
    case "Possible Scam":
      return {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        bar: "bg-rose-500",
        icon: <AlertOctagon className="w-6 h-6 text-rose-600" />
      };
  }
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!message.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate a brief analysis delay for better UX
    setTimeout(() => {
      setResult(analyzeMessage(message));
      setIsAnalyzing(false);
    }, 600);
  };

  const handleClear = () => {
    setMessage("");
    setResult(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 md:py-24 flex flex-col">
        
        {/* Header */}
        <header className="mb-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/20">
            <Shield className="w-8 h-8 text-primary" strokeWidth={2} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Scam Detector
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Check suspicious messages before you trust them. Paste your text below to get an instant safety analysis.
          </p>
        </header>

        {/* Input Area */}
        <div className="bg-card border shadow-sm rounded-2xl p-4 md:p-6 mb-8 transition-all hover-elevate">
          <label htmlFor="message-input" className="block text-sm font-semibold text-foreground mb-3">
            Message Content
          </label>
          <textarea
            id="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Your account has been suspended. Click this link within 24 hours and verify your account to avoid permanent closure..."
            className="w-full min-h-[160px] p-4 text-base bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y mb-4"
          />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!message.trim() || isAnalyzing}
              className="flex-1 bg-primary text-primary-foreground font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed hover-elevate active-elevate"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Message
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={!message.trim() && !result}
              className="sm:flex-none px-6 py-3.5 font-medium text-foreground bg-secondary border border-border rounded-xl transition-all hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover-elevate active-elevate"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`border rounded-2xl overflow-hidden shadow-lg ${getLevelColors(result.level).bg} ${getLevelColors(result.level).border}`}
            >
              <div className="p-6 md:p-8">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/60 rounded-full shadow-sm">
                      {getLevelColors(result.level).icon}
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${getLevelColors(result.level).text}`}>
                        {result.level}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      Risk Score
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {result.score} <span className="text-lg text-muted-foreground font-medium">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden mb-8 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                    className={`h-full rounded-full ${getLevelColors(result.level).bar}`}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Reasons */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Why this result?
                    </h3>
                    <ul className="space-y-3">
                      {result.reasons.map((reason, idx) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + (idx * 0.1) }}
                          key={idx} 
                          className="flex gap-3 text-foreground"
                        >
                          <div className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${getLevelColors(result.level).bar}`} />
                          <span className="leading-snug text-[15px]">{reason}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Safety Tips */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Safety Tips
                    </h3>
                    <ul className="space-y-3">
                      {getSafetyTips(result.level).map((tip, idx) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          key={idx} 
                          className="flex gap-3 text-foreground"
                        >
                          <div className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-foreground/30" />
                          <span className="leading-snug text-[15px]">{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer / Disclaimer */}
      <footer className="mt-auto py-8 text-center px-4">
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          This tool provides an estimated risk level only. Always verify suspicious messages through official channels.
        </p>
      </footer>
    </div>
  );
}
