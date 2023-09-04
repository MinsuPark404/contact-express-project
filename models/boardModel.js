const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 게시글 스키마 정의
const boardSchema = new Schema({
    title: {
        type: String,
        required: [true, '게시글에는 제목이 필요합니다'],
        trim: true
    },
    content: {
        type: String,
        required: [true, '게시글에는 내용이 필요합니다']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, '게시글은 사용자에게 속해야 합니다']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    tags: [String],
    category: String,
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['public', 'private', 'archived'],
        default: 'public'
    }
});

// 수정될 때마다 updatedAt 필드 업데이트
boardSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// 게시글 모델 생성
const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
