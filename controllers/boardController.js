// 필요한 모듈 임포트
const Board = require('../models/boardModel'); // 데이터베이스와 상호작용을 위한 게시판 모델 임포트
const User = require('../models/userModel'); // 인증 목적으로 사용자 모델 임포트
const asyncHandler = require('express-async-handler'); // 비동기 오류를 처리하기 위한 미들웨어

// 새 게시글 생성
const createPost = asyncHandler(async (req, res, next) => {
    // 들어온 요청의 사용자 ID를 데이터베이스와 비교하여 인증 확인
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
        // 사용자를 찾을 수 없는 경우, 인증되지 않았다고 응답
        return res.status(401).json({
            status: 'fail',
            message: 'Unauthorized'
        });
    }
    
    // 데이터베이스에 새 게시글 생성
    const newPost = await Board.create({
        ...req.body, // 스프레드 연산자를 사용하여 요청 본문의 모든 속성 전달
        user: req.user.id  // 인증된 사용자 ID를 게시글에 추가
    });
    // 성공적인 응답 반환
    res.status(201).json({
        status: 'success',
        data: {
            post: newPost
        }
    });
});

// 페이지네이션을 적용한 모든 게시글 조회
const getPosts = asyncHandler(async (req, res, next) => {
    // 쿼리 파라미터를 사용하여 페이지네이션 구현
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    // 데이터베이스에서 게시글을 찾고, 정렬 및 페이지네이션 적용
    const posts = await Board.find()
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');  // 최신 게시글부터 정렬
    // 찾은 게시글 반환
    res.status(200).json({
        status: 'success',
        results: posts.length,
        data: {
            posts
        }
    });
});

// 특정 게시물 읽기
const getPost = asyncHandler(async (req, res, next) => {
    const post = await Board.findById(req.params.id);
    if (!post) {
        return next(new AppError('No post found with that ID', 404));
    }
    post.views += 1;  // Increase the view count
    await post.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            post
        }
    });
});

// 게시글 수정
const updatePost = asyncHandler(async (req, res, next) => {
    // 사용자와 게시글 ID를 검증하여 이 게시글을 수정할 권한이 있는지 확인
    const currentUser = await User.findById(req.user.id);
    const post = await Board.findById(req.params.id);
    if (!currentUser || !post || post.user.toString() !== req.user.id.toString()) {
        // 권한이 없는 경우, 금지된 상태로 응답
        return res.status(403).json({
            status: 'fail',
            message: 'Forbidden'
        });
    }
    // 데이터베이스에서 게시글 수정
    const updatedPost = await Board.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // 수정된 게시글을 반환
        runValidators: true // 모델에서 정의한 검증 실행
    });
    // 수정된 게시글 반환
    res.status(200).json({
        status: 'success',
        data: {
            post: updatedPost
        }
    });
});

// 게시글 삭제
const deletePost = asyncHandler(async (req, res, next) => {
    // 사용자와 게시글 ID를 검증하여 이 게시글을 삭제할 권한이 있는지 확인
    const currentUser = await User.findById(req.user.id);
    const post = await Board.findById(req.params.id);
    if (!currentUser || !post || post.user.toString() !== req.user.id.toString()) {
        // 권한이 없는 경우, 금지된 상태로 응답
        return res.status(403).json({
            status: 'fail',
            message: 'Forbidden'
        });
    }
    // 데이터베이스에서 게시글 삭제
    await Board.findByIdAndDelete(req.params.id);
    // 내용 없는 성공 응답 반환
    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
	createPost,
	getPosts,
	updatePost,
	deletePost,
	getPost
}