import React, { useState } from 'react';
import { Template, CoupleEvent, Language } from '../../types';
import { Palette, Plus, Edit3, Eye, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { requestAppFullscreen } from '../../utils/fullscreen';
import { formatImageUrl, handleImageError } from '../../utils/imageHelper';
import { isTemplateSupported } from '../../data/initialData';

interface AdminTemplatesPageProps {
  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  couples: CoupleEvent[];
  setCouples: React.Dispatch<React.SetStateAction<CoupleEvent[]>>;
  lang: Language;
  onOpenNewTemplate: () => void;
  onEditTemplate: (tpl: Template) => void;
  onPreviewCouple: (coupleId: string, templateId?: string) => void;
  onDeleteTemplate?: (tpl: Template) => void;
}

export const AdminTemplatesPage: React.FC<AdminTemplatesPageProps> = ({
  templates,
  setTemplates,
  couples,
  setCouples,
  lang,
  onOpenNewTemplate,
  onEditTemplate,
  onPreviewCouple,
  onDeleteTemplate,
}) => {
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredTemplates = (templates || []).filter(isTemplateSupported);

  const confirmDeleteTemplate = (tpl: Template) => {
    if (filteredTemplates.length <= 1) {
      alert(lang === 'km' 
        ? 'មិនអាចលុបបានទេ! ប្រព័ន្ធត្រូវរក្សាទុកយ៉ាងហោចណាស់គំរូរចនាប័ទ្មចំនួន ១។' 
        : 'Cannot delete! At least one template must remain in the system.');
      return;
    }

    try {
      const deletedIds = JSON.parse(localStorage.getItem('deleted_template_ids') || '[]');
      if (!deletedIds.includes(tpl.id)) {
        localStorage.setItem('deleted_template_ids', JSON.stringify([...deletedIds, tpl.id]));
      }
    } catch {}

    if (onDeleteTemplate) {
      onDeleteTemplate(tpl);
    } else {
      // Find another template to fallback for couples currently using this template
      const remainingTemplates = templates.filter(t => t.id !== tpl.id);
      const fallbackTemplateId = remainingTemplates[0]?.id || 'tpl_gold_01';

      // Update couples using this template
      setCouples(prev => prev.map(c => c.templateId === tpl.id ? { ...c, templateId: fallbackTemplateId } : c));

      // Remove template from state
      setTemplates(prev => prev.filter(t => t.id !== tpl.id));
    }

    setTemplateToDelete(null);
    setFeedbackMsg(lang === 'km' 
      ? `បានលុបរចនាប័ទ្ម «${tpl.nameKh}» ដោយជោគជ័យ!` 
      : `Template "${tpl.nameEn || tpl.nameKh}" deleted successfully!`);

    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header - Clean & Minimal */}
      <div className="flex items-center justify-between gap-4 pt-1 pb-1">
        <h2 className="text-xl sm:text-2xl font-normal text-gray-900 font-khmer-title flex items-center gap-2.5">
          <span className="w-2.5 h-6 bg-[#D4AF37] rounded-full"></span>
          <span>{lang === 'km' ? 'បណ្ណាល័យគំរូរចនា' : 'Template Catalog'}</span>
        </h2>

        <button
          onClick={onOpenNewTemplate}
          className="bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-white px-4 py-2 rounded-xl text-xs font-normal hover:brightness-110 shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'km' ? '+ បង្កើតគំរូថ្មី' : '+ New Template'}</span>
        </button>
      </div>

      {/* Success Feedback Notification Banner */}
      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{feedbackMsg}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Templates Grid Cards - 16:9 Aspect Ratio without text */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => (
          <div 
            key={tpl.id}
            className="group bg-white border border-[#EAE6E1] rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            {/* Top Visual Card Preview - 16:9 Aspect Ratio, Click to Preview Full Screen */}
            <div 
              onClick={() => {
                if (couples.length > 0) {
                  requestAppFullscreen();
                  onPreviewCouple(couples[0].id, tpl.id);
                }
              }}
              title={lang === 'km' ? 'ចុចលើរូបដើម្បីមើលគំរូពេញអេក្រង់ (Click to Preview)' : 'Click to preview fullscreen'}
              className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer group/img"
            >
              <img 
                src={formatImageUrl(tpl.coverImage)} 
                alt={tpl.nameKh}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const currentSrc = target.src;
                  if (currentSrc.includes('lh3.googleusercontent.com/d/')) {
                    const fileId = currentSrc.split('/d/')[1];
                    if (fileId) {
                      target.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
                    }
                  }
                }}
              />
              {/* Subtle hover overlay indicating click to preview */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-xs text-white text-[11px] rounded-full font-battambang shadow-sm">
                  {lang === 'km' ? '👁️ ចុចមើលគំរូ' : '👁️ Click to preview'}
                </span>
              </div>
            </div>

            {/* Footer: Template Name on Left, Icon-only Action Buttons on Right */}
            <div className="p-3.5 border-t border-gray-100 flex items-center justify-between gap-3 bg-white shrink-0">
              <div 
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => {
                  if (couples.length > 0) {
                    requestAppFullscreen();
                    onPreviewCouple(couples[0].id, tpl.id);
                  }
                }}
              >
                <h4 className="font-medium text-xs text-gray-900 truncate font-battambang hover:text-[#D4AF37] transition-colors" title={tpl.nameKh}>
                  {tpl.nameKh}
                </h4>
                <span className="text-[10px] text-gray-400 font-battambang block mt-0.5">
                  {lang === 'km' ? `ប្រើ ${tpl.usageCount} ដង` : `Used ${tpl.usageCount} times`}
                </span>
              </div>

              {/* Action Buttons - Edit and Delete only */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onEditTemplate(tpl)}
                  title={lang === 'km' ? 'កែសម្រួល' : 'Edit'}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setTemplateToDelete(tpl)}
                  title={lang === 'km' ? 'លុបរចនាប័ទ្ម' : 'Delete Template'}
                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer transition-colors active:scale-95 shadow-2xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EAE6E1] rounded-3xl p-12 text-center space-y-3">
          <Palette className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70" />
          <h3 className="text-base font-normal font-khmer-title text-gray-800">
            {lang === 'km' ? 'រកមិនឃើញរចនាប័ទ្មដែលត្រូវគ្នាទេ' : 'No templates match your filter'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto font-battambang">
            {lang === 'km' ? 'សូមសាកល្បងជ្រើសរើស «រចនាប័ទ្មទាំងអស់» ដើម្បីមើលគំរូទាំងអស់ឡើងវិញ។' : 'Try clearing your search or filter to see all templates.'}
          </p>
          <button
            onClick={onOpenNewTemplate}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8962D] text-white text-xs rounded-xl font-normal transition-colors cursor-pointer"
          >
            {lang === 'km' ? '+ បង្កើតគំរូថ្មី' : '+ Create New Template'}
          </button>
        </div>
      )}

      {/* Delete Template Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EAE6E1] shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 font-khmer-title">
                  {lang === 'km' ? 'តើអ្នកពិតជាចង់លុបរចនាប័ទ្មនេះ?' : 'Delete This Template?'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'km' 
                    ? 'សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ គំរូនេះនឹងត្រូវដកចេញពីបណ្ណាល័យ។' 
                    : 'This action cannot be undone. The template will be removed from your catalog.'}
                </p>
              </div>
            </div>

            {/* Target Template Card Summary */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
              <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                <img 
                  src={formatImageUrl(templateToDelete.coverImage)} 
                  alt={templateToDelete.nameKh} 
                  onError={(e) => handleImageError(e)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-xs text-gray-900 truncate font-battambang">
                  {templateToDelete.nameKh}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Code: <span className="font-semibold text-gray-700">{templateToDelete.code}</span>
                </div>
              </div>
            </div>

            {/* Warning if couples are currently using this template */}
            {couples.filter(c => c.templateId === templateToDelete.id).length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  {lang === 'km' 
                    ? `មានគូស្នេហ៍ចំនួន ${couples.filter(c => c.templateId === templateToDelete.id).length} គូ កំពុងប្រើប្រាស់ម៉ូតនេះ។ ប្រសិនបើលុប ប្រព័ន្ធនឹងប្តូរគូស្នេហ៍ទាំងនោះទៅកាន់ម៉ូតផ្សេងទៀតដោយស្វ័យប្រវត្តិ។` 
                    : `${couples.filter(c => c.templateId === templateToDelete.id).length} couple(s) are using this template. They will be reassigned to another available template.`}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2.5 text-xs font-normal text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                {lang === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => confirmDeleteTemplate(templateToDelete)}
                className="px-5 py-2.5 text-xs font-normal bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{lang === 'km' ? 'បាទ/ចាស លុបចេញ' : 'Yes, Delete Template'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
