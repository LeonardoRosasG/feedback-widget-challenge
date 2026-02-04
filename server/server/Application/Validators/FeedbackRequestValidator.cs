using FluentValidation;
using server.Application.DTOs;

namespace server.Application.Validators;

public class FeedbackRequestValidator : AbstractValidator<FeedbackRequest>
{
    public FeedbackRequestValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty()
            .WithMessage("ProjectId is required")
            .MaximumLength(100)
            .WithMessage("ProjectId must not exceed 100 characters")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("ProjectId can only contain letters, numbers, hyphens and underscores");

        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("UserId is required")
            .MaximumLength(100)
            .WithMessage("UserId must no exceed 100 characters");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5)
            .WithMessage("Rating must be between 1 and 5");

        RuleFor(X => X.Comment)
            .MaximumLength(1000)
            .WithMessage("Comment must no exceed 1000 characters")
            .When(x => x.Comment != null);

        RuleFor(x => x.Timestamp)
            .NotEmpty()
            .WithMessage("Timestamp is required")
            .Must(BeAValidTimestamp)
            .WithMessage("Timestamp cannot be in the future");
    }

    private static bool BeAValidTimestamp(DateTime timestamp)
    {
        return timestamp <= DateTime.UtcNow.AddMinutes(5);
    }
}
