import { Octokit } from '@octokit/rest';
import { GetPRCommentsParams, Comment, CommentReply } from './types.js';

export class GitHubService {
    private octokit: Octokit;

    constructor(token: string) {
        this.octokit = new Octokit({
            auth: token
        });
    }

    async getPRComments({ owner, repo, pull_number }: GetPRCommentsParams): Promise<Comment[]> {
        try {
            // Fetch review comments on the pull request (line comments)
            const { data: reviewComments } = await this.octokit.pulls.listReviewComments({
                owner,
                repo,
                pull_number,
                per_page: 100
            });

            // Group comments by their path and in_reply_to_id
            const groupedComments = new Map<number, Comment>();
            const replyMap = new Map<number, CommentReply[]>();

            // Process all comments and separate top-level comments from replies
            for (const comment of reviewComments) {
                if (comment.in_reply_to_id) {
                    // This is a reply to another comment
                    const reply: CommentReply = {
                        id: comment.id,
                        body: comment.body,
                        user: {
                            login: comment.user?.login || 'unknown'
                        },
                        created_at: comment.created_at
                    };

                    if (!replyMap.has(comment.in_reply_to_id)) {
                        replyMap.set(comment.in_reply_to_id, []);
                    }
                    replyMap.get(comment.in_reply_to_id)?.push(reply);
                } else {
                    // This is a top-level comment
                    const newComment: Comment = {
                        id: comment.id,
                        path: comment.path,
                        body: comment.body,
                        line: comment.line || undefined,
                        start_line: comment.start_line || undefined,
                        user: {
                            login: comment.user?.login || 'unknown'
                        },
                        created_at: comment.created_at,
                        replies: []
                    };
                    groupedComments.set(comment.id, newComment);
                }
            }

            // Attach replies to their parent comments
            for (const [commentId, replies] of replyMap.entries()) {
                const parentComment = groupedComments.get(commentId);
                if (parentComment) {
                    parentComment.replies = replies;
                }
            }

            return Array.from(groupedComments.values());
        } catch (error) {
            console.error('Error fetching PR comments:', error);
            throw error;
        }
    }
} 