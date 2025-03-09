export interface CommentReply {
    id: number;
    body: string;
    user: {
        login: string;
    };
    created_at: string;
}

export interface Comment {
    id: number;
    path: string;
    body: string;
    line?: number;
    start_line?: number;
    user: {
        login: string;
    };
    created_at: string;
    replies: CommentReply[];
}

export interface GetPRCommentsParams {
    owner: string;
    repo: string;
    pull_number: number;
}

export interface GetPRCommentsResponse {
    comments: Comment[];
} 