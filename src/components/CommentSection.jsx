// import { useState, useEffect, useMemo } from 'react';
// import { FiHeart, FiThumbsDown, FiMessageSquare, FiMoreHorizontal, FiChevronDown, FiChevronUp } from 'react-icons/fi';
// import { formatDate } from '../utils';
// import { useAuthStore } from '../store/authStore';
// import { useNotificationStore } from '../store/notificationStore';
// import Avatar from './Avatar';

// import {
//   getComments,
//   createComment,
//   updateComment,
//   deleteComment,
//   toggleCommentReaction,
// } from '../services/commentApi';

// import Loader from './Loader';

// const MAX_CHARS_WITHOUT_SPACE = 1000;
// const COMMENTS_PER_PAGE = 10;
// const INITIAL_VISIBLE_LINES = 2;

// // Color palette
// const colors = {
//   primary: '#3b82f6',
//   primaryLight: '#93c5fd',
//   accent: '#ef4444',       // red for likes
//   danger: '#ef4444',
//   success: '#10b981',
//   gray: '#6b7280',
//   grayLight: '#f3f4f6',
//   border: '#e5e7eb',
//   charGood: '#10b981',     // green
//   charOver: '#ef4444',     // red
// };

// const CommentSection = ({ blogId }) => {
//   const { user, isAuthenticated } = useAuthStore();
//   const currentUserId = user?._id;
//   const { addNotification } = useNotificationStore();

//   const [comments, setComments] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [newComment, setNewComment] = useState('');
//   const [replyTo, setReplyTo] = useState(null);
//   const [replyText, setReplyText] = useState('');
//   const [editingId, setEditingId] = useState(null);
//   const [editContent, setEditContent] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [submittingReaction, setSubmittingReaction] = useState({});
//   const [userReactions, setUserReactions] = useState({});
//   const [expandedReplies, setExpandedReplies] = useState({});
//   const [expandedContent, setExpandedContent] = useState({});
//   const [showMoreMenu, setShowMoreMenu] = useState(null);

//   useEffect(() => {
//     const loadComments = async () => {
//       setLoading(true);
//       try {
//         const res = await getComments(blogId, currentPage, COMMENTS_PER_PAGE);
//         console.log('comments res : ',res)
//         if (res?.success) {
//           setComments(res.data?.comments || []);
//           setTotal(res.data?.total || 0);
//         }
//       } catch (err) {
//         addNotification('Failed to load comments', 'error');
//       }
//       setLoading(false);
//     };
//     if (blogId) loadComments();
//   }, [blogId, currentPage, addNotification]);

//   const countCharsWithoutSpace = (str) => str.replace(/\s+/g, '').length;

//   const commentTree = useMemo(() => {
//     const map = {};
//     const roots = [];

//     // Build map
//     comments.forEach((c) => {
//       map[c._id] = { ...c, replies: [] };
//     });

//     // Build tree (respect depth limit)
//     comments.forEach((c) => {
//       const depth = c.depth || 0;
//       if (c.parent && map[c.parent._id] && depth < 5) {
//         map[c.parent._id].replies.push(map[c._id]);
//       } else if (!c.parent) {
//         roots.push(map[c._id]);
//       }
//     });

//     return roots;
//   }, [comments]);

//   const handlePostComment = async (e, isReply = false, parentId = null, depth = 0) => {
//     e.preventDefault();

//     if (isReply && depth >= 5) {
//       addNotification('Maximum reply depth reached (level 5)', 'error');
//       return;
//     }

//     const text = (isReply ? replyText : newComment).trim();
//     if (!text || !isAuthenticated || submitting) return;

//     const charCount = countCharsWithoutSpace(text);
//     if (charCount > MAX_CHARS_WITHOUT_SPACE) {
//       addNotification(`Max ${MAX_CHARS_WITHOUT_SPACE} chars allowed (without spaces)`, 'error');
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const res = await createComment(blogId, text, isReply ? parentId : null);
//       if (res?.success) {
//         const newC = res.data;
//         setComments((prev) => [newC, ...prev]);
//         setTotal((prev) => prev + 1);

//         addNotification(isReply ? 'Reply posted' : 'Comment posted', 'success');

//         if (isReply) {
//           setReplyTo(null);
//           setReplyText('');
//           setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
//         } else {
//           setNewComment('');
//         }
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Failed to post';
//       addNotification(msg, 'error');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleReaction = async (commentId, type) => {
//     if (!isAuthenticated || submittingReaction[commentId]) return;

//     const prev = userReactions[commentId];
//     const next = prev === type ? null : type;

//     setUserReactions((p) => ({ ...p, [commentId]: next }));
//     setSubmittingReaction((p) => ({ ...p, [commentId]: true }));

//     try {
//       const res = await toggleCommentReaction(blogId, commentId, type);
//       if (res?.success) {
//         setComments((prev) =>
//           prev.map((c) => (c._id === commentId ? res.data || res : c))
//         );
//       } else {
//         throw new Error();
//       }
//     } catch {
//       setUserReactions((p) => ({ ...p, [commentId]: prev }));
//       addNotification('Failed to update reaction', 'error');
//     } finally {
//       setSubmittingReaction((p) => ({ ...p, [commentId]: false }));
//     }
//   };

//   const handleDelete = async (commentId) => {
//     if (!window.confirm('Delete this comment?')) return;

//     try {
//       const res = await deleteComment(blogId, commentId);
//       if (res?.success) {
//         setComments((prev) => prev.filter((c) => c._id !== commentId));
//         setTotal((prev) => prev - 1);
//         addNotification('Comment deleted', 'success');
//       }
//     } catch {
//       addNotification('Failed to delete comment', 'error');
//     }
//   };

//   const isOwn = (comment) => currentUserId && comment.author?._id === currentUserId;

//   const canDelete = (comment) => {
//     if (!isOwn(comment)) return false;
//     const diff = (Date.now() - new Date(comment.createdAt).getTime()) / 60000;
//     return diff <= 5;
//   };

//   const startEdit = (comment) => {
//     setEditingId(comment._id);
//     setEditContent(comment.content);
//   };

//   const toggleContentExpand = (id) => {
//     setExpandedContent((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const shouldShowReadMore = (content = '') => {
//     if (!content) return false;
//     const lines = content.split('\n').length;
//     return content.length > 180 || lines > INITIAL_VISIBLE_LINES;
//   };

//   const getCharCountColor = (count) =>
//     count > MAX_CHARS_WITHOUT_SPACE ? colors.charOver : colors.charGood;

//   const renderCommentCard = (comment, isReply = false, depth = 0) => {
//     const isEditing = editingId === comment._id;
//     const userReaction = userReactions[comment._id];
//     const isLiked = userReaction === 'like';
//     const isDisliked = userReaction === 'dislike';
//     const isSubmittingThis = submittingReaction[comment._id];
//     const showActions = isOwn(comment);
//     const isExpanded = expandedReplies[comment._id];
//     const isContentExpanded = expandedContent[comment._id];
//     const replyCount = comment.replies?.length || 0;
//     const canReply = depth < 5 && isAuthenticated;

//     const marginLeft = isReply ? { marginLeft: `${depth * 16}px` } : {};

//     const contentLines = comment.content.split('\n');
//     const truncated = !isContentExpanded && contentLines.length > INITIAL_VISIBLE_LINES;
//     const displayed = truncated
//       ? contentLines.slice(0, INITIAL_VISIBLE_LINES).join('\n') + '...'
//       : comment.content;

//     return (
//       <div key={comment._id} style={marginLeft}>
//         <div className="flex gap-3 py-3 border-b" style={{ borderColor: colors.border }}>
//           <Avatar
//             name={comment.author?.fullName}
//             url={comment.author?.profileImage?.url}
//             size="sm"
//           />

//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
//                 {comment.author?.fullName || 'Anonymous'}
//               </span>
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 {formatDate(comment.createdAt)}
//               </span>
//             </div>

//             {isEditing ? (
//               <div className="mt-2">
//                 <textarea
//                   value={editContent}
//                   onChange={(e) => setEditContent(e.target.value)}
//                   className="w-full px-3 py-2 text-sm border rounded resize-none bg-white dark:bg-gray-800 dark:border-gray-700"
//                   style={{ borderColor: colors.border }}
//                   rows={3}
//                   maxLength={2000}
//                 />
//                 <div className="mt-2 flex justify-end gap-2">
//                   <button
//                     onClick={() => { setEditingId(null); setEditContent(''); }}
//                     className="px-3 py-1 text-xs border rounded"
//                     style={{ borderColor: colors.border, color: colors.gray }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={async () => {
//                       if (!editContent.trim()) return;
//                       try {
//                         const res = await updateComment(blogId, comment._id, editContent.trim());
//                         if (res?.success) {
//                           setComments((prev) =>
//                             prev.map((c) => (c._id === comment._id ? res.data : c))
//                           );
//                         }
//                       } catch {}
//                       setEditingId(null);
//                       setEditContent('');
//                     }}
//                     className="px-3 py-1 text-xs text-white rounded"
//                     style={{ backgroundColor: colors.primary }}
//                   >
//                     Save
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
//                 {displayed}
//                 {shouldShowReadMore(comment.content) && (
//                   <button
//                     onClick={() => toggleContentExpand(comment._id)}
//                     className="ml-2 text-xs font-medium"
//                     style={{ color: colors.primary }}
//                   >
//                     {isContentExpanded ? 'Read less' : 'Read more'}
//                   </button>
//                 )}
//               </div>
//             )}

//             {!isEditing && (
//               <div className="flex items-center gap-6 mt-2 text-xs">
//                 <button
//                   onClick={() => handleReaction(comment._id, 'like')}
//                   disabled={!isAuthenticated || isSubmittingThis}
//                   className="flex items-center gap-1"
//                   style={{ color: isLiked ? colors.accent : colors.gray }}
//                 >
//                   <FiHeart size={14} className={isLiked ? 'fill-current' : ''} />
//                   <span>{comment.likes?.length || 0}</span>
//                 </button>

//                 <button
//                   onClick={() => handleReaction(comment._id, 'dislike')}
//                   disabled={!isAuthenticated || isSubmittingThis}
//                   className="flex items-center gap-1"
//                   style={{ color: isDisliked ? colors.gray : colors.gray }}
//                 >
//                   <FiThumbsDown size={14} className={isDisliked ? 'fill-current' : ''} />
//                   <span>{comment.dislikes?.length || 0}</span>
//                 </button>

//                 {canReply && (
//                   <button
//                     onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
//                     className="flex items-center gap-1"
//                     style={{ color: colors.primary }}
//                   >
//                     <FiMessageSquare size={14} />
//                     Reply
//                   </button>
//                 )}

//                 {showActions && (
//                   <div className="relative ml-auto">
//                     <button
//                       onClick={() => setShowMoreMenu(showMoreMenu === comment._id ? null : comment._id)}
//                       className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
//                       style={{ color: colors.gray }}
//                     >
//                       <FiMoreHorizontal size={16} />
//                     </button>

//                     {showMoreMenu === comment._id && (
//                       <div
//                         className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border rounded-md shadow-lg text-xs z-10"
//                         style={{ borderColor: colors.border }}
//                       >
//                         <button
//                           onClick={() => { startEdit(comment); setShowMoreMenu(null); }}
//                           className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
//                         >
//                           Edit
//                         </button>
//                         {canDelete(comment) && (
//                           <button
//                             onClick={() => { handleDelete(comment._id); setShowMoreMenu(null); }}
//                             className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
//                           >
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {replyTo === comment._id && canReply && (
//               <form
//                 onSubmit={(e) => handlePostComment(e, true, comment._id, depth + 1)}
//                 className="mt-4 pt-3 border-t"
//                 style={{ borderColor: colors.border }}
//               >
//                 <textarea
//                   value={replyText}
//                   onChange={(e) => setReplyText(e.target.value)}
//                   placeholder="Write your reply..."
//                   className="w-full px-3 py-2 text-sm border rounded resize-none bg-white dark:bg-gray-800 dark:border-gray-700 min-h-[60px]"
//                   rows={2}
//                   maxLength={2000}
//                 />
//                 <div className="mt-2 flex justify-between items-center text-xs">
//                   <span style={{ color: getCharCountColor(countCharsWithoutSpace(replyText)) }}>
//                     {countCharsWithoutSpace(replyText)} / {MAX_CHARS_WITHOUT_SPACE}
//                   </span>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setReplyTo(null)}
//                       className="px-3 py-1 text-xs border rounded"
//                       style={{ borderColor: colors.border, color: colors.gray }}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={submitting || !replyText.trim() || countCharsWithoutSpace(replyText) > MAX_CHARS_WITHOUT_SPACE}
//                       className="px-4 py-1 text-xs text-white rounded font-medium"
//                       style={{
//                         backgroundColor:
//                           submitting || countCharsWithoutSpace(replyText) > MAX_CHARS_WITHOUT_SPACE
//                             ? colors.primaryLight
//                             : colors.primary,
//                       }}
//                     >
//                       {submitting ? 'Posting...' : 'Reply'}
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             )}

//             {!isReply && replyCount > 0 && (
//               <button
//                 onClick={() => setExpandedReplies((prev) => ({ ...prev, [comment._id]: !isExpanded }))}
//                 className="mt-2 flex items-center gap-1.5 text-xs font-medium"
//                 style={{ color: colors.primary }}
//               >
//                 {isExpanded ? (
//                   <>
//                     <FiChevronUp size={14} /> Hide replies
//                   </>
//                 ) : (
//                   <>
//                     <FiChevronDown size={14} /> Show {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>

//         {!isReply && isExpanded && comment.replies?.length > 0 && (
//           <div style={{ borderLeft: `2px solid ${colors.primaryLight}`, marginLeft: '20px', paddingLeft: '12px' }}>
//             {comment.replies.map((reply) => renderCommentCard(reply, true, depth + 1))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) return <div className="mt-10 pt-6"><Loader /></div>;

//   const totalPages = Math.ceil(total / COMMENTS_PER_PAGE);

//   return (
//     <div className="mt-10 pt-6 border-t" style={{ borderColor: colors.border }}>
//       <h3 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
//         Comments {total > 0 && <span className="text-sm font-normal text-gray-500">({total})</span>}
//       </h3>

//       {isAuthenticated ? (
//         <form onSubmit={(e) => handlePostComment(e)} className="mb-8 pb-6 border-b" style={{ borderColor: colors.border }}>
//           <div className="flex gap-3">
//             <Avatar name={user?.fullName} url={user?.profileImage?.url} size="sm" />
//             <div className="flex-1">
//               <textarea
//                 value={newComment}
//                 onChange={(e) => setNewComment(e.target.value)}
//                 placeholder="Add a comment..."
//                 className="w-full px-3 py-2 text-sm border rounded resize-none bg-white dark:bg-gray-800 dark:border-gray-700 min-h-[70px]"
//                 rows={2}
//                 maxLength={2000}
//               />
//               <div className="mt-2 flex justify-between items-center text-xs">
//                 <span style={{ color: getCharCountColor(countCharsWithoutSpace(newComment)) }}>
//                   {countCharsWithoutSpace(newComment)} / {MAX_CHARS_WITHOUT_SPACE}
//                 </span>
//                 <button
//                   type="submit"
//                   disabled={submitting || !newComment.trim() || countCharsWithoutSpace(newComment) > MAX_CHARS_WITHOUT_SPACE}
//                   className="px-5 py-1.5 text-sm text-white font-medium rounded"
//                   style={{
//                     backgroundColor:
//                       submitting || countCharsWithoutSpace(newComment) > MAX_CHARS_WITHOUT_SPACE
//                         ? colors.primaryLight
//                         : colors.primary,
//                   }}
//                 >
//                   {submitting ? 'Posting...' : 'Post Comment'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </form>
//       ) : (
//         <div className="mb-8 p-4 text-center text-sm rounded border bg-gray-50 dark:bg-gray-800/40" style={{ borderColor: colors.border }}>
//           Please sign in to leave a comment
//         </div>
//       )}

//       {commentTree.length > 0 ? (
//         commentTree.map((comment) => renderCommentCard(comment, false, 0))
//       ) : (
//         <div className="text-center py-10 text-gray-500 dark:text-gray-400">
//           No comments yet. Be the first to comment!
//         </div>
//       )}

//       {totalPages > 1 && (
//         <div className="flex justify-center gap-2 mt-10 pt-6 border-t" style={{ borderColor: colors.border }}>
//           <button
//             onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-4 py-1.5 text-sm border rounded disabled:opacity-50"
//             style={{ borderColor: colors.border }}
//           >
//             Previous
//           </button>

//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => setCurrentPage(page)}
//               className="px-3 py-1.5 text-sm border rounded"
//               style={{
//                 backgroundColor: currentPage === page ? colors.primary : 'transparent',
//                 color: currentPage === page ? 'white' : colors.gray,
//                 borderColor: currentPage === page ? colors.primary : colors.border,
//               }}
//             >
//               {page}
//             </button>
//           ))}

//           <button
//             onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             className="px-4 py-1.5 text-sm border rounded disabled:opacity-50"
//             style={{ borderColor: colors.border }}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CommentSection;


import { useState, useEffect, useMemo } from 'react';
import {
  FiHeart,
  FiThumbsDown,
  FiMessageSquare,
  FiMoreHorizontal,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { formatDate } from '../utils';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import Avatar from './Avatar';

import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentReaction,
} from '../services/commentApi';

import Loader from './Loader';

const MAX_CHARS_WITHOUT_SPACE = 1000;
const COMMENTS_PER_PAGE = 10;
const MAX_DEPTH = 5;
const INITIAL_VISIBLE_LINES = 2;

const colors = {
  primary: '#3b82f6',
  primaryLight: '#93c5fd',
  accent: '#ef4444',       // like color
  gray: '#6b7280',
  border: '#e5e7eb',
  charLow: '#9ca3af',
  charGood: '#10b981',
  charOver: '#ef4444',
};

const CommentSection = ({ blogId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const currentUserId = user?._id;
  const { addNotification } = useNotificationStore();

  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const res = await getComments(blogId, currentPage, COMMENTS_PER_PAGE);
        if (res?.success) {
          setComments(res.data?.comments || []);
          setTotal(res.data?.total || 0);
        }
      } catch (err) {
        addNotification('Failed to load comments', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (blogId) loadComments();
  }, [blogId, currentPage]);

  const countChars = (str) => str.replace(/\s+/g, '').length;

  // Build nested structure
  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];

    // 1. Create map of all comments
    comments.forEach((c) => {
      map[c._id] = { ...c, replies: [] };
    });

    // 2. Connect replies to parents
    comments.forEach((c) => {
      const depth = c.depth || 0;
      if (c.parent?._id && map[c.parent._id] && depth < MAX_DEPTH) {
        map[c.parent._id].replies.push(map[c._id]);
      } else if (!c.parent) {
        roots.push(map[c._id]);
      }
    });

    return roots;
  }, [comments]);

  const handlePostComment = async (e, isReply = false, parentId = null, depth = 0) => {
    e.preventDefault();
    const text = isReply ? replyText.trim() : newComment.trim();

    if (!text || !isAuthenticated || submitting) return;

    if (depth >= MAX_DEPTH) {
      addNotification(`Maximum reply depth (${MAX_DEPTH}) reached`, 'error');
      return;
    }

    if (countChars(text) > MAX_CHARS_WITHOUT_SPACE) {
      addNotification(`Max ${MAX_CHARS_WITHOUT_SPACE} characters allowed`, 'error');
      return;
    }

    setSubmitting(true);

    try {
      const res = await createComment(blogId, text, isReply ? parentId : null);
      if (res?.success) {
        setComments((prev) => [res.data, ...prev]);
        setTotal((prev) => prev + 1);

        if (isReply) {
          setReplyTo(null);
          setReplyText('');
          setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
        } else {
          setNewComment('');
        }

        addNotification(isReply ? 'Reply posted' : 'Comment posted', 'success');
      }
    } catch (err) {
      addNotification('Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getCharColor = (count) => {
    if (count < 3) return colors.charLow;
    if (count <= MAX_CHARS_WITHOUT_SPACE) return colors.charGood;
    return colors.charOver;
  };

  const renderComment = (comment, depth = 0) => {
    const isReplyOpen = expandedReplies[comment._id] ?? false;
    const hasReplies = comment.replies?.length > 0;
    const canReply = depth < MAX_DEPTH && isAuthenticated;

    return (
      <div
        key={comment._id}
        style={{
          marginLeft: `${depth * 24}px`,
          position: 'relative',
        }}
      >
        {/* Vertical nesting line */}
        {depth > 0 && (
          <div
            style={{
              position: 'absolute',
              left: '-12px',
              top: 0,
              bottom: '50%',
              width: '2px',
              backgroundColor: colors.primaryLight,
            }}
          />
        )}

        <div className="flex gap-3 py-4 border-b last:border-b-0" style={{ borderColor: colors.border }}>
          <Avatar
            name={comment.author?.fullName}
            url={comment.author?.profileImage?.url}
            size="sm"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <strong className="text-sm">{comment.author?.fullName || 'Anonymous'}</strong>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>

            <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>

            <div className="flex flex-wrap gap-5 mt-3 text-xs text-gray-600">
              <button className="flex items-center gap-1 hover:text-red-600">
                <FiHeart size={14} /> {comment.likes?.length || 0}
              </button>
              <button className="flex items-center gap-1 hover:text-gray-800">
                <FiThumbsDown size={14} /> {comment.dislikes?.length || 0}
              </button>

              {canReply && (
                <button
                  onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <FiMessageSquare size={14} /> Reply
                </button>
              )}
            </div>

            {/* Reply input */}
            {replyTo === comment._id && canReply && (
              <form
                onSubmit={(e) => handlePostComment(e, true, comment._id, depth)}
                className="mt-4 pl-4 border-l-2"
                style={{ borderColor: colors.primaryLight }}
              >
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full p-2.5 text-sm border rounded resize-y min-h-[70px]"
                  style={{ borderColor: colors.border }}
                />
                <div className="mt-2 flex justify-between items-center text-xs">
                  <span style={{ color: getCharColor(countChars(replyText)) }}>
                    {countChars(replyText)} / {MAX_CHARS_WITHOUT_SPACE}
                  </span>
                  <button
                    type="submit"
                    disabled={submitting || countChars(replyText) > MAX_CHARS_WITHOUT_SPACE}
                    className="px-4 py-1.5 text-white text-sm rounded"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {submitting ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </form>
            )}

            {/* Expand / collapse replies */}
            {hasReplies && (
              <button
                onClick={() => setExpandedReplies((prev) => ({ ...prev, [comment._id]: !isReplyOpen }))}
                className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                {isReplyOpen ? (
                  <>
                    <FiChevronUp size={14} /> Hide replies
                  </>
                ) : (
                  <>
                    <FiChevronDown size={14} /> Show {comment.replies.length} repl
                    {comment.replies.length === 1 ? 'y' : 'ies'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Render nested replies */}
        {isReplyOpen && hasReplies && (
          <div className="mt-1">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader />
      </div>
    );
  }

  const totalPages = Math.ceil(total / COMMENTS_PER_PAGE);

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6">Comments {total > 0 && `(${total})`}</h3>

      {/* New comment form */}
      {isAuthenticated ? (
        <form
          onSubmit={(e) => handlePostComment(e)}
          className="mb-10 pb-8 border-b"
          style={{ borderColor: colors.border }}
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-lg resize-y min-h-[90px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ borderColor: colors.border }}
          />
          <div className="mt-3 flex justify-between items-center text-sm">
            <span style={{ color: getCharColor(countChars(newComment)) }}>
              {countChars(newComment)} / {MAX_CHARS_WITHOUT_SPACE}
            </span>
            <button
              type="submit"
              disabled={submitting || countChars(newComment) > MAX_CHARS_WITHOUT_SPACE}
              className="px-6 py-2 text-white font-medium rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-5 text-center border rounded-lg bg-gray-50" style={{ borderColor: colors.border }}>
          Sign in to leave a comment
        </div>
      )}

      {/* Comments list */}
      {commentTree.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No comments yet. Be the first!</div>
      ) : (
        <div className="space-y-1">
          {commentTree.map((comment) => renderComment(comment, 0))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10 pt-6 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-5 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: colors.border }}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border rounded ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'hover:bg-gray-100'
              }`}
              style={{
                borderColor: currentPage === page ? colors.primary : colors.border,
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-5 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: colors.border }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;