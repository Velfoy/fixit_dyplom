// "use client";

// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import "@/styles/users.css";
// import "@/styles/orders.css";
// import "@/styles/order-components.css";

// interface TaskCommentsDialogProps {
//   show: boolean;
//   onClose: () => void;
//   selectedTask: any;
//   session: any;
//   taskComments: any[];
//   loadingComments: boolean;
//   newComment: string;
//   setNewComment: (value: string) => void;
//   commentTitle: string;
//   setCommentTitle: (value: string) => void;
//   uploadedFiles: any[];
//   uploadingFile: boolean;
//   isSubmitting: boolean;
//   onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onRemoveFile: (fileId: number) => void;
//   onAddComment: () => void;
//   onDeleteComment: (commentId: number) => void;
// }

// export function TaskCommentsDialog({
//   show,
//   onClose,
//   selectedTask,
//   session,
//   taskComments,
//   loadingComments,
//   newComment,
//   setNewComment,
//   commentTitle,
//   setCommentTitle,
//   uploadedFiles,
//   uploadingFile,
//   isSubmitting,
//   onFileUpload,
//   onRemoveFile,
//   onAddComment,
//   onDeleteComment,
// }: TaskCommentsDialogProps) {
//   return (
//     <Dialog
//       open={show}
//       onOpenChange={(open) => {
//         if (!open) onClose();
//       }}
//     >
//       <DialogContent className="dialog-content comments-dialog-content">
//         <DialogHeader>
//           <DialogTitle className="dialog-title">
//             Task Comments: {selectedTask?.title}
//           </DialogTitle>
//         </DialogHeader>
//         <div className="dialog-body comments-dialog-body">
//           {/* Add Comment Form - Only for Admin */}
//           {session?.user?.role === "ADMIN" && (
//             <div className="comment-form-container">
//               <h4 className="comment-form-title">Add Comment</h4>
//               <div className="comment-form-inputs">
//                 <Input
//                   placeholder="Comment title (optional)"
//                   value={commentTitle}
//                   onChange={(e) => setCommentTitle(e.target.value)}
//                   className="comment-title-input"
//                 />
//                 <textarea
//                   placeholder="Write your comment..."
//                   value={newComment}
//                   onChange={(e) => setNewComment(e.target.value)}
//                   className="comment-textarea"
//                 />
//               </div>

//               {/* File Upload */}
//               <div className="file-upload-section">
//                 <label
//                   htmlFor="comment-file-upload"
//                   className={`file-upload-label ${
//                     uploadingFile ? "uploading" : ""
//                   }`}
//                 >
//                   {uploadingFile ? "Uploading..." : "Attach File/Video"}
//                 </label>
//                 <input
//                   id="comment-file-upload"
//                   type="file"
//                   accept="image/*,video/*,.pdf,.doc,.docx"
//                   onChange={onFileUpload}
//                   disabled={uploadingFile}
//                   className="file-upload-input"
//                 />
//                 <p className="file-upload-hint">
//                   Supported: Images, Videos, PDF, Word documents (Max 50MB)
//                 </p>
//               </div>

//               {/* Uploaded Files Preview */}
//               {uploadedFiles.length > 0 && (
//                 <div className="uploaded-files-container">
//                   <p className="uploaded-files-title">Attached Files:</p>
//                   <div className="uploaded-files-list">
//                     {uploadedFiles.map((file) => (
//                       <div key={file.id} className="uploaded-file-item">
//                         <span>{file.filename}</span>
//                         <button
//                           onClick={() => onRemoveFile(file.id)}
//                           className="uploaded-file-remove"
//                         >
//                           ×
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <Button
//                 onClick={onAddComment}
//                 disabled={!newComment.trim() || isSubmitting}
//                 className="dialog-btn dialog-btn--primary comment-submit-btn"
//               >
//                 {isSubmitting ? "Adding..." : "Add Comment"}
//               </Button>
//             </div>
//           )}

//           {/* Comments List */}
//           <div>
//             <h4 className="comments-list-title">
//               Comments ({taskComments.length})
//             </h4>
//             {loadingComments ? (
//               <p className="comments-loading">Loading comments...</p>
//             ) : taskComments.length === 0 ? (
//               <p className="comments-empty">
//                 No comments yet. Be the first to add one!
//               </p>
//             ) : (
//               <div className="comments-list">
//                 {taskComments.map((comment) => {
//                   const commentAuthorId =
//                     comment.employees?.users?.id;
//                   const canDelete =
//                     session?.user?.id &&
//                     commentAuthorId === parseInt(session.user.id);

//                   return (
//                     <div key={comment.id} className="comment-item">
//                       <div className="comment-header">
//                         <div className="comment-author-info">
//                           <div className="comment-author-name-row">
//                             <strong className="comment-author-name">
//                               {comment.employees?.users?.first_name ||
//                                 comment.admin_author?.first_name ||
//                                 "Unknown"}{" "}
//                               {comment.employees?.users?.last_name ||
//                                 comment.admin_author?.last_name ||
//                                 "User"}
//                             </strong>
//                             {comment.title && (
//                               <span className="comment-title-text">
//                                 - {comment.title}
//                               </span>
//                             )}
//                           </div>
//                           <div className="comment-meta-info">
//                             <span className="comment-timestamp">
//                               {new Date(comment.created_at).toLocaleString(
//                                 "en-US",
//                                 {
//                                   year: "numeric",
//                                   month: "short",
//                                   day: "numeric",
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 }
//                               )}
//                             </span>
//                             {(comment.employees?.users?.email ||
//                               comment.admin_author?.email) && (
//                               <span className="comment-email">
//                                 {comment.employees?.users?.email ||
//                                   comment.admin_author?.email}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         {canDelete && (
//                           <button
//                             onClick={() => onDeleteComment(comment.id)}
//                             className="comment-delete-btn"
//                             title="Delete this comment"
//                           >
//                             ✕
//                           </button>
//                         )}
//                       </div>
//                       <p className="comment-message">{comment.message}</p>

//                       {/* Attached Documents */}
//                       {comment.document && comment.document.length > 0 && (
//                         <div className="comment-attachments-section">
//                           <p className="comment-attachments-title">
//                             Attachments:
//                           </p>
//                           <div className="comment-attachments-list">
//                             {comment.document.map((doc: any) => (
//                               <a
//                                 key={doc.id}
//                                 href={doc.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="comment-attachment-link"
//                               >
//                                 {doc.type === "PHOTO" && "📷"}
//                                 {doc.type === "VIDEO" && "🎥"}
//                                 {doc.type === "DOCUMENT" && "📄"}
//                                 <span className="comment-attachment-filename">
//                                   {doc.filename}
//                                 </span>
//                               </a>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="dialog-actions">
//           <Button
//             className="dialog-btn dialog-btn--secondary"
//             onClick={onClose}
//           >
//             Close
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
